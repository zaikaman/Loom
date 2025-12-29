import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getFeedIndexFromCloudinary, setFeedIndexInCloudinary } from "@/lib/cloudinary";

interface FeedIndexExtendedData {
    type: "loom-feed-index";
    publishedRoadmapIds: string[];
}

interface RoadmapExtendedData {
    type?: "roadmap";
    status?: "planned" | "in-progress" | "shipped";
    visibility?: "public" | "private";
    description?: string;
    followers?: string[];
    ownerId?: string;
    features?: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        votes: number;
        upvotedBy?: string[];
        createdAt: string;
    }>;
}

// Get the feed index thread ID from Cloudinary or env
async function getFeedIndexId(): Promise<string | null> {
    // First check env var
    if (process.env.FEED_INDEX_ID) {
        return process.env.FEED_INDEX_ID;
    }

    // Then check Cloudinary
    return await getFeedIndexFromCloudinary();
}

// Create the feed index thread (using API key for global access)
async function createFeedIndexThread(): Promise<ForumsThread> {
    console.log("[Feed] Creating feed index thread");

    const extendedData: FeedIndexExtendedData = {
        type: "loom-feed-index",
        publishedRoadmapIds: [],
    };

    const thread = await forumsRequest<ForumsThread>({
        method: "POST",
        path: "/api/v1/thread",
        body: {
            title: `Loom Public Feed Index`,
            body: "System thread for storing published roadmap references",
            categoryId: 1, // Default category required by Foru.ms
            userId: "dce59c80-7ee2-4a20-a7a1-b2d127a9ee89", // System user
            extendedData: extendedData as unknown as Record<string, unknown>,
        },
        // Use API key (no token) so this is a "system" thread
    });

    console.log("[Feed] Created feed index thread:", thread.id);
    await setFeedIndexInCloudinary(thread.id);

    return thread;
}

// GET /api/feed - Get public roadmaps for the feed
export async function GET() {
    try {
        let feedIndexId = await getFeedIndexId();

        if (!feedIndexId) {
            // Create the feed index thread
            const feedIndex = await createFeedIndexThread();
            feedIndexId = feedIndex.id;
        }

        console.log("[GET /api/feed] Feed index:", feedIndexId);

        // Fetch the feed index thread
        let feedIndex: ForumsThread;
        try {
            feedIndex = await getThread(feedIndexId);
        } catch {
            // Feed index was deleted, create new one
            const newFeedIndex = await createFeedIndexThread();
            return NextResponse.json({
                roadmaps: [],
                feedIndexId: newFeedIndex.id,
            });
        }

        const indexData = feedIndex.extendedData as FeedIndexExtendedData | undefined;
        const publishedIds = indexData?.publishedRoadmapIds || [];

        console.log("[GET /api/feed] Published IDs:", publishedIds.length);

        if (publishedIds.length === 0) {
            return NextResponse.json({ roadmaps: [], feedIndexId });
        }

        // Fetch all published roadmaps
        const roadmaps = await Promise.all(
            publishedIds.map(async (id) => {
                try {
                    const thread = await getThread(id);
                    const extendedData = thread.extendedData as RoadmapExtendedData | undefined;
                    const featureCount = extendedData?.features?.length || 0;
                    const totalUpvotes = extendedData?.features?.reduce((sum, f) => sum + (f.votes || 0), 0) || 0;

                    let avatarUrl: string | undefined;
                    try {
                        const userId = (thread as unknown as { user?: { id: string } }).user?.id;
                        if (userId) {
                            const user = await import("@/lib/forums").then(m => m.getUser(userId));
                            avatarUrl = (user.extendedData as { avatarUrl?: string })?.avatarUrl;
                        }
                    } catch (e) {
                        console.error("Failed to fetch author avatar:", e);
                    }

                    return {
                        id: thread.id,
                        title: thread.title,
                        description: extendedData?.description || thread.body || "",
                        status: extendedData?.status || "planned",
                        visibility: extendedData?.visibility || "public",
                        lastUpdated: thread.updatedAt,
                        createdAt: thread.createdAt,
                        author: {
                            id: (thread as unknown as { user?: { id: string; username: string } }).user?.id,
                            username: (thread as unknown as { user?: { id: string; username: string } }).user?.username,
                            avatarUrl,
                        },
                        featureCount,
                        totalUpvotes,
                    };
                } catch {
                    return null;
                }
            })
        );

        // Filter out null results AND private roadmaps (in case they were made private after publishing)
        const validRoadmaps = roadmaps.filter((r): r is NonNullable<typeof r> => r !== null && r.visibility === "public");

        // Sort by most recent
        validRoadmaps.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        console.log("[GET /api/feed] Valid roadmaps:", validRoadmaps.length);

        return NextResponse.json({ roadmaps: validRoadmaps, feedIndexId });
    } catch (error) {
        console.error("[GET /api/feed] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch feed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/feed - Publish a roadmap to the public feed
export async function POST(request: NextRequest) {
    try {
        const token = await (await import("@/lib/session")).getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await getMe(token); // Verify user is authenticated
        const body = await request.json();
        const { roadmapId } = body;

        if (!roadmapId) {
            return NextResponse.json({ error: "Roadmap ID is required" }, { status: 400 });
        }

        // Get or create feed index
        let feedIndexId = await getFeedIndexId();
        let currentIds: string[] = [];

        if (!feedIndexId) {
            const feedIndex = await createFeedIndexThread();
            feedIndexId = feedIndex.id;
        } else {
            try {
                const feedIndex = await getThread(feedIndexId);
                const indexData = feedIndex.extendedData as FeedIndexExtendedData | undefined;
                currentIds = indexData?.publishedRoadmapIds || [];
            } catch {
                // Feed index was deleted, create new one
                const feedIndex = await createFeedIndexThread();
                feedIndexId = feedIndex.id;
            }
        }

        // Check if already published
        if (currentIds.includes(roadmapId)) {
            return NextResponse.json({
                success: true,
                message: "Already published",
                feedIndexId,
            });
        }

        console.log("[POST /api/feed] Publishing roadmap:", roadmapId);

        // Add to feed index
        const newIds = [...currentIds, roadmapId];
        const extendedData: FeedIndexExtendedData = {
            type: "loom-feed-index",
            publishedRoadmapIds: newIds,
        };

        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${feedIndexId}`,
            body: {
                extendedData: extendedData as unknown as Record<string, unknown>,
            },
            // Use API key for system thread update
        });

        console.log("[POST /api/feed] Roadmap published. Total:", newIds.length);

        return NextResponse.json({
            success: true,
            feedIndexId,
            totalPublished: newIds.length,
        });
    } catch (error) {
        console.error("[POST /api/feed] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to publish to feed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/feed - Unpublish a roadmap from the public feed
export async function DELETE(request: NextRequest) {
    try {
        const token = await (await import("@/lib/session")).getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const roadmapId = searchParams.get("roadmapId");

        if (!roadmapId) {
            return NextResponse.json({ error: "Roadmap ID is required" }, { status: 400 });
        }

        const feedIndexId = await getFeedIndexId();
        if (!feedIndexId) {
            return NextResponse.json({ error: "Feed not initialized" }, { status: 400 });
        }

        console.log("[DELETE /api/feed] Unpublishing roadmap:", roadmapId);

        // Get current IDs
        const feedIndex = await getThread(feedIndexId);
        const indexData = feedIndex.extendedData as FeedIndexExtendedData | undefined;
        const currentIds = indexData?.publishedRoadmapIds || [];

        // Remove the roadmap ID
        const newIds = currentIds.filter(id => id !== roadmapId);

        const extendedData: FeedIndexExtendedData = {
            type: "loom-feed-index",
            publishedRoadmapIds: newIds,
        };

        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${feedIndexId}`,
            body: {
                extendedData: extendedData as unknown as Record<string, unknown>,
            },
        });

        console.log("[DELETE /api/feed] Roadmap unpublished. Remaining:", newIds.length);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/feed] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to unpublish from feed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

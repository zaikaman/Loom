import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

interface RoadmapExtendedData {
    type: "roadmap";
    status: "planned" | "in-progress" | "shipped";
    visibility: "public" | "private";
    description?: string;
    followers?: string[];
    ownerId?: string;
}

interface IndexExtendedData {
    type: "loom-index";
    roadmapIds: string[];
}

const INDEX_THREAD_COOKIE_PREFIX = "loom_index_thread_";

// Get index thread ID from cookie (user-specific)
async function getIndexThreadIdFromCookie(userId: string): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(`${INDEX_THREAD_COOKIE_PREFIX}${userId}`)?.value || null;
}

// Store index thread ID in cookie (user-specific)
async function setIndexThreadIdCookie(userId: string, threadId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(`${INDEX_THREAD_COOKIE_PREFIX}${userId}`, threadId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
    });
}

// Create an index thread for a user
async function createIndexThread(userId: string, token: string): Promise<ForumsThread> {
    console.log("[createIndexThread] Creating for user:", userId);

    const extendedData: IndexExtendedData = {
        type: "loom-index",
        roadmapIds: [],
    };

    const thread = await forumsRequest<ForumsThread>({
        method: "POST",
        path: "/api/v1/thread",
        body: {
            title: `Loom Index`,
            body: "System thread for storing user roadmap references",
            userId,
            extendedData: extendedData as unknown as Record<string, unknown>,
        },
        token,
    });

    console.log("[createIndexThread] Created:", thread.id);
    await setIndexThreadIdCookie(userId, thread.id);

    return thread;
}

// Update the index thread with new roadmap IDs
async function updateIndexThread(
    threadId: string,
    roadmapIds: string[],
    token: string
): Promise<void> {
    console.log("[updateIndexThread] Updating:", threadId, "IDs:", roadmapIds);

    const extendedData: IndexExtendedData = {
        type: "loom-index",
        roadmapIds,
    };

    await forumsRequest<ForumsThread>({
        method: "PUT",
        path: `/api/v1/thread/${threadId}`,
        body: {
            extendedData: extendedData as unknown as Record<string, unknown>,
        },
        token,
    });

    console.log("[updateIndexThread] Updated successfully");
}

// GET /api/roadmaps - List all roadmaps for the current user
export async function GET(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const indexThreadId = await getIndexThreadIdFromCookie(user.id);

        console.log("[GET /api/roadmaps] User:", user.id, "Index thread:", indexThreadId);

        if (!indexThreadId) {
            console.log("[GET /api/roadmaps] No index thread for user");
            return NextResponse.json({ roadmaps: [] });
        }

        // Fetch the index thread
        let indexThread: ForumsThread;
        try {
            indexThread = await getThread(indexThreadId);
        } catch {
            console.log("[GET /api/roadmaps] Index thread not found");
            return NextResponse.json({ roadmaps: [] });
        }

        // Verify ownership - only show roadmaps if the index thread belongs to this user
        const indexData = indexThread.extendedData as IndexExtendedData | undefined;
        const indexOwnerId = (indexThread as unknown as { userId?: string }).userId;
        if (indexOwnerId && indexOwnerId !== user.id) {
            console.log("[GET /api/roadmaps] Index thread belongs to different user:", indexOwnerId);
            return NextResponse.json({ roadmaps: [] });
        }

        const roadmapIds = indexData?.roadmapIds || [];

        console.log("[GET /api/roadmaps] Roadmap IDs:", roadmapIds);

        if (roadmapIds.length === 0) {
            return NextResponse.json({ roadmaps: [] });
        }

        // Fetch all roadmaps by ID
        const roadmaps = await Promise.all(
            roadmapIds.map(async (id) => {
                try {
                    const thread = await getThread(id);
                    const extendedData = thread.extendedData as RoadmapExtendedData | undefined;
                    return {
                        id: thread.id,
                        title: thread.title,
                        description: extendedData?.description || thread.body || "",
                        status: extendedData?.status || "planned",
                        visibility: extendedData?.visibility || "public",
                        lastUpdated: thread.updatedAt,
                        featureCount: 0,
                    };
                } catch {
                    return null;
                }
            })
        );

        const validRoadmaps = roadmaps.filter((r) => r !== null);
        console.log("[GET /api/roadmaps] Valid roadmaps:", validRoadmaps.length);

        return NextResponse.json({ roadmaps: validRoadmaps });
    } catch (error) {
        console.error("[GET /api/roadmaps] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch roadmaps";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/roadmaps - Create a new roadmap
export async function POST(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();
        const { title, description, visibility = "public" } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        console.log("[POST /api/roadmaps] Creating for user:", user.id);

        // Create the roadmap thread
        const roadmapExtendedData: RoadmapExtendedData = {
            type: "roadmap",
            status: "planned",
            visibility,
            description,
            followers: [],
            ownerId: user.id,
        };

        const thread = await forumsRequest<ForumsThread>({
            method: "POST",
            path: "/api/v1/thread",
            body: {
                title,
                body: description || "",
                userId: user.id,
                extendedData: roadmapExtendedData as unknown as Record<string, unknown>,
            },
            token,
        });

        console.log("[POST /api/roadmaps] Roadmap thread created:", thread.id);

        // Get or create the index thread
        let indexThreadId = await getIndexThreadIdFromCookie(user.id);
        let currentIds: string[] = [];

        if (!indexThreadId) {
            // Create new index thread
            const indexThread = await createIndexThread(user.id, token);
            indexThreadId = indexThread.id;
        } else {
            // Fetch current IDs from existing index thread
            try {
                const indexThread = await getThread(indexThreadId);
                const indexData = indexThread.extendedData as IndexExtendedData | undefined;
                currentIds = indexData?.roadmapIds || [];
            } catch {
                // Index thread was deleted, create new one
                const indexThread = await createIndexThread(user.id, token);
                indexThreadId = indexThread.id;
            }
        }

        // Update index thread with new roadmap ID
        const newIds = [...currentIds, thread.id];
        await updateIndexThread(indexThreadId, newIds, token);

        return NextResponse.json({
            roadmap: {
                id: thread.id,
                title: thread.title,
                description: roadmapExtendedData.description,
                status: roadmapExtendedData.status,
                visibility: roadmapExtendedData.visibility,
                createdAt: thread.createdAt,
            }
        }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/roadmaps] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create roadmap";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

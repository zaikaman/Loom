import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsPost, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { RoadmapExtendedData, Feature } from "@/lib/types";

// Helper to check user's role in the roadmap
function getUserRole(
    userId: string,
    extendedData: RoadmapExtendedData | undefined,
    threadOwnerId?: string
): "owner" | "editor" | "viewer" | null {
    if (extendedData?.ownerId === userId || threadOwnerId === userId) {
        return "owner";
    }
    const teamMember = extendedData?.team?.find(
        (m) => m.userId === userId && m.status === "accepted"
    );
    return teamMember?.role || null;
}

// GET /api/roadmaps/[id]/features - List features for a roadmap
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: roadmapId } = await params;

        // Get current user (optional - for checking if they upvoted)
        let currentUserId: string | null = null;
        try {
            const token = await getSession();
            if (token) {
                const user = await getMe(token);
                currentUserId = user.id;
            }
        } catch {
            // Not logged in, that's ok
        }

        console.log("[GET /features] Fetching features for roadmap:", roadmapId);

        // Get the thread to read features from extendedData
        const thread = await getThread(roadmapId);
        const threadExtended = thread.extendedData as RoadmapExtendedData | undefined;
        const features = threadExtended?.features || [];

        console.log("[GET /features] Found features:", features.length);

        // Format for frontend - include createdBy info
        const formattedFeatures = features.map(f => ({
            id: f.id,
            title: f.title,
            description: f.description,
            status: f.status,
            date: new Date(f.createdAt).toLocaleDateString(),
            votes: f.votes || 0,
            hasUpvoted: currentUserId ? (f.upvotedBy || []).includes(currentUserId) : false,
            comments: (f.comments || []).length,
            roadmapId,
            createdBy: f.createdBy,
            aiAnalysis: f.aiAnalysis,
        }));

        return NextResponse.json({ features: formattedFeatures });
    } catch (error) {
        console.error("[GET /features] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch features";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/roadmaps/[id]/features - Create a new feature
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const { id: roadmapId } = await params;
        const body = await request.json();
        const { title, description, status = "planned" } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Get the thread and check permissions
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as unknown as RoadmapExtendedData) || {} as RoadmapExtendedData;
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        // Check if user has permission to create features
        const userRole = getUserRole(user.id, threadExtended, threadOwnerId);

        if (userRole !== "owner" && userRole !== "editor") {
            return NextResponse.json(
                { error: "You don't have permission to add features to this roadmap" },
                { status: 403 }
            );
        }

        console.log("[POST /features] Creating feature for roadmap:", roadmapId);
        console.log("[POST /features] Title:", title, "Status:", status, "By:", user.username);

        // Create the feature as a post in the roadmap thread
        const postExtendedData = {
            type: "feature",
            title,
            status,
            votes: 0,
            createdBy: { userId: user.id, username: user.username },
        };

        const post = await forumsRequest<ForumsPost>({
            method: "POST",
            path: "/api/v1/post",
            body: {
                body: `## ${title}\n\n${description || ""}`,
                threadId: roadmapId,
                userId: user.id,
                extendedData: postExtendedData,
            },
            token,
        });

        console.log("[POST /features] Post created:", post.id);

        // Create feature object to store in thread
        const newFeature: Feature = {
            id: post.id,
            title,
            description: description || "",
            status,
            votes: 0,
            upvotedBy: [],
            createdAt: post.createdAt || new Date().toISOString(),
            createdBy: { userId: user.id, username: user.username },
        };

        // Update the roadmap thread's extendedData to include this feature
        const features = threadExtended.features || [];
        features.push(newFeature);

        console.log("[POST /features] Updating thread extendedData with", features.length, "features");

        // Use API key to ensure team members can update
        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...threadExtended,
                    features,
                },
            },
        });

        console.log("[POST /features] Thread updated successfully");

        const response = NextResponse.json({
            feature: {
                id: post.id,
                title,
                description,
                status,
                votes: 0,
                hasUpvoted: false,
                roadmapId,
                createdAt: post.createdAt,
                createdBy: { userId: user.id, username: user.username },
            },
        }, { status: 201 });

        // Trigger AI Triage
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        console.log(`[POST /api/features] Triggering AI triage for Feature ${post.id}`);

        // Fire and forget - do not await
        fetch(`${baseUrl}/api/webhooks/triage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: `${title}\n${description || ""}`,
                resourceId: post.id,
                resourceType: "feature",
                parentId: roadmapId,
            }),
        }).catch(err => console.error("Failed to trigger triage:", err));

        return response;
    } catch (error) {
        console.error("[POST /features] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create feature";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PUT /api/roadmaps/[id]/features - Upvote a feature
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const { id: roadmapId } = await params;
        const body = await request.json();
        const { featureId, action, title, description, status, links } = body;


        if (!featureId) {
            return NextResponse.json({ error: "Feature ID is required" }, { status: 400 });
        }

        console.log("[PUT /features] Upvote action:", action, "for feature:", featureId);

        // Get the thread
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as unknown as RoadmapExtendedData) || {} as RoadmapExtendedData;
        const features = threadExtended.features || [];

        // Find the feature
        const featureIndex = features.findIndex(f => f.id === featureId);
        if (featureIndex === -1) {
            return NextResponse.json({ error: "Feature not found" }, { status: 404 });
        }

        const feature = features[featureIndex];
        const upvotedBy = feature.upvotedBy || [];
        const hasUpvoted = upvotedBy.includes(user.id);

        if (action === 'upvote') {
            if (hasUpvoted) {
                return NextResponse.json({ error: "Already upvoted" }, { status: 400 });
            }
            upvotedBy.push(user.id);
            feature.votes = upvotedBy.length;
        } else if (action === 'remove') {
            if (!hasUpvoted) {
                return NextResponse.json({ error: "Not upvoted yet" }, { status: 400 });
            }
            const idx = upvotedBy.indexOf(user.id);
            upvotedBy.splice(idx, 1);
            feature.votes = upvotedBy.length;
        } else if (title || status || description) {
            // Update feature details
            // Check permissions again just to be safe (though owner/editor check should technically be higher up for broad edits)
            const userRole = getUserRole(user.id, threadExtended, (thread as unknown as { userId?: string }).userId);
            if (userRole !== "owner" && userRole !== "editor") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }

            if (title) feature.title = title;
            if (description !== undefined) feature.description = description;
            if (status) feature.status = status;
            // We don't have links in the Feature type yet, but if we did:
            // if (links) feature.links = links;
        } else {
            // Toggle behavior (default fallback for upvotes if no specific action/data)
            if (hasUpvoted) {
                const idx = upvotedBy.indexOf(user.id);
                upvotedBy.splice(idx, 1);
            } else {
                upvotedBy.push(user.id);
            }
            feature.votes = upvotedBy.length;
        }

        feature.upvotedBy = upvotedBy;
        features[featureIndex] = feature;

        // Update the thread - use API key (no token) for admin access
        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...threadExtended,
                    features,
                },
            },
        });

        console.log("[PUT /features] Upvote updated. New vote count:", feature.votes);

        return NextResponse.json({
            feature: {
                id: feature.id,
                votes: feature.votes,
                hasUpvoted: upvotedBy.includes(user.id),
                title: feature.title,
                description: feature.description,
                status: feature.status
            },
        });
    } catch (error) {
        console.error("[PUT /features] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to update upvote";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

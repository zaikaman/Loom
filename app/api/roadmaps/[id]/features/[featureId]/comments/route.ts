import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsThread, getMe, getThread, getUser } from "@/lib/forums";
import { getSession } from "@/lib/session";

interface StoredComment {
    id: string;
    body: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    createdAt: string;
}

interface Feature {
    id: string;
    title: string;
    description: string;
    status: "planned" | "in-progress" | "shipped";
    votes: number;
    upvotedBy: string[];
    createdAt: string;
    comments?: StoredComment[];
}

interface RoadmapExtendedData {
    type?: "roadmap";
    status?: "planned" | "in-progress" | "shipped";
    visibility?: "public" | "private";
    description?: string;
    followers?: string[];
    ownerId?: string;
    features?: Feature[];
}

// GET /api/roadmaps/[id]/features/[featureId]/comments - List comments for a feature
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; featureId: string }> }
) {
    try {
        const { id: roadmapId, featureId } = await params;

        console.log("[GET /comments] Fetching comments for feature:", featureId, "in roadmap:", roadmapId);

        // Get the thread to read comments from the feature's extendedData
        const thread = await getThread(roadmapId);
        const threadExtended = thread.extendedData as RoadmapExtendedData | undefined;
        const features = threadExtended?.features || [];

        // Find the feature
        const feature = features.find(f => f.id === featureId);
        const comments = feature?.comments || [];

        console.log("[GET /comments] Found", comments.length, "comments");

        // Fetch avatar URLs for comments that don't have one stored
        const commentsWithAvatars = await Promise.all(
            comments.map(async (comment) => {
                if (comment.avatarUrl) return comment;
                try {
                    const user = await getUser(comment.userId);
                    const avatarUrl = (user.extendedData as { avatarUrl?: string })?.avatarUrl;
                    return { ...comment, avatarUrl };
                } catch {
                    return comment;
                }
            })
        );

        return NextResponse.json({ comments: commentsWithAvatars });
    } catch (error) {
        console.error("[GET /comments] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch comments";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/roadmaps/[id]/features/[featureId]/comments - Create a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; featureId: string }> }
) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const { id: roadmapId, featureId } = await params;
        const body = await request.json();
        const { body: commentBody } = body;

        if (!commentBody || !commentBody.trim()) {
            return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
        }

        console.log("[POST /comments] Creating comment for feature:", featureId);

        // Get the thread
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as RoadmapExtendedData) || {};
        const features = threadExtended.features || [];

        // Find the feature
        const featureIndex = features.findIndex(f => f.id === featureId);
        if (featureIndex === -1) {
            return NextResponse.json({ error: "Feature not found" }, { status: 404 });
        }

        // Get user's avatar URL
        const userAvatarUrl = (user.extendedData as { avatarUrl?: string })?.avatarUrl;

        // Create the new comment
        const newComment: StoredComment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            body: commentBody.trim(),
            userId: user.id,
            username: user.displayName || user.username,
            avatarUrl: userAvatarUrl,
            createdAt: new Date().toISOString(),
        };

        // Add comment to feature
        const feature = features[featureIndex];
        feature.comments = [...(feature.comments || []), newComment];
        features[featureIndex] = feature;

        console.log("[POST /comments] Updating thread with new comment");

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
            // Note: no token = uses API key auth for admin access
        });

        console.log("[POST /comments] Comment created:", newComment.id);

        return NextResponse.json({
            comment: newComment,
        }, { status: 201 });
    } catch (error) {
        console.error("[POST /comments] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create comment";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

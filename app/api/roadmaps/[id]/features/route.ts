import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsPost, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";

interface Feature {
    id: string;
    title: string;
    description: string;
    status: "planned" | "in-progress" | "shipped";
    votes: number;
    upvotedBy: string[]; // Track who upvoted
    createdAt: string;
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

        // Format for frontend
        const formattedFeatures = features.map(f => ({
            id: f.id,
            title: f.title,
            description: f.description,
            status: f.status,
            date: new Date(f.createdAt).toLocaleDateString(),
            votes: f.votes || 0,
            hasUpvoted: currentUserId ? (f.upvotedBy || []).includes(currentUserId) : false,
            comments: 0, // Not implemented
            roadmapId,
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

        console.log("[POST /features] Creating feature for roadmap:", roadmapId);
        console.log("[POST /features] Title:", title, "Status:", status);

        // Create the feature as a post in the roadmap thread
        const postExtendedData = {
            type: "feature",
            title,
            status,
            votes: 0,
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
        };

        // Update the roadmap thread's extendedData to include this feature
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as RoadmapExtendedData) || {};
        const features = threadExtended.features || [];
        features.push(newFeature);

        console.log("[POST /features] Updating thread extendedData with", features.length, "features");

        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...threadExtended,
                    features,
                },
            },
            token,
        });

        console.log("[POST /features] Thread updated successfully");

        return NextResponse.json({
            feature: {
                id: post.id,
                title,
                description,
                status,
                votes: 0,
                hasUpvoted: false,
                roadmapId,
                createdAt: post.createdAt,
            },
        }, { status: 201 });
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
        const { featureId, action } = body; // action: 'upvote' or 'remove'

        if (!featureId) {
            return NextResponse.json({ error: "Feature ID is required" }, { status: 400 });
        }

        console.log("[PUT /features] Upvote action:", action, "for feature:", featureId);

        // Get the thread
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as RoadmapExtendedData) || {};
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
        } else {
            // Toggle behavior
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
        // This allows non-owners to upvote features on any public roadmap
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

        console.log("[PUT /features] Upvote updated. New vote count:", feature.votes);

        return NextResponse.json({
            feature: {
                id: feature.id,
                votes: feature.votes,
                hasUpvoted: upvotedBy.includes(user.id),
            },
        });
    } catch (error) {
        console.error("[PUT /features] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to update upvote";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

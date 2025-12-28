import { NextRequest, NextResponse } from "next/server";
import { createPost, forumsRequest, ForumsPost, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { getMe } from "@/lib/forums";

interface FeatureExtendedData {
    type: "feature";
    title: string;
    status: "planned" | "in-progress" | "shipped";
    votes?: number;
}

interface ThreadExtendedData {
    featureIds?: string[];
}

// GET /api/roadmaps/[id]/features - List features for a roadmap
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: roadmapId } = await params;

        // Get the thread to see stored feature IDs
        const thread = await getThread(roadmapId);
        const threadExtended = thread.extendedData as ThreadExtendedData | undefined;
        const featureIds = threadExtended?.featureIds || [];

        // Fetch all features (posts) for this roadmap
        const features = await Promise.all(
            featureIds.map(async (postId) => {
                try {
                    // Foru.ms doesn't have a direct GET /post/:id in the docs,
                    // so we store feature data in extendedData when creating
                    // For now, return placeholder until we can properly fetch
                    return {
                        id: postId,
                        title: "Feature",
                        description: "",
                        status: "planned" as const,
                        date: new Date().toLocaleDateString(),
                        votes: 0,
                        comments: 0,
                        roadmapId,
                    };
                } catch {
                    return null;
                }
            })
        );

        // If no features stored, return empty array
        const validFeatures = features.filter((f) => f !== null);

        return NextResponse.json({ features: validFeatures });
    } catch (error) {
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

        const extendedData: FeatureExtendedData = {
            type: "feature",
            title,
            status,
            votes: 0,
        };

        // Create the feature as a post in the roadmap thread
        const post = await createPost({
            body: `## ${title}\n\n${description || ""}`,
            threadId: roadmapId,
            userId: user.id,
            extendedData: extendedData as unknown as Record<string, unknown>,
        });

        // Update the thread's extendedData to track this feature
        const thread = await getThread(roadmapId);
        const threadExtended = (thread.extendedData as ThreadExtendedData) || {};
        const featureIds = threadExtended.featureIds || [];
        featureIds.push(post.id);

        await forumsRequest({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...threadExtended,
                    featureIds,
                },
            },
            token, // Use user's JWT token for permission
        });

        return NextResponse.json({
            feature: {
                id: post.id,
                title,
                description,
                status,
                votes: 0,
                roadmapId,
                createdAt: post.createdAt,
            },
        }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create feature";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

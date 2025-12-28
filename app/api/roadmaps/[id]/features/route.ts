import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsPost, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";

interface Feature {
    id: string;
    title: string;
    description: string;
    status: "planned" | "in-progress" | "shipped";
    votes: number;
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
            token, // User can update their own thread
        });

        console.log("[POST /features] Thread updated successfully");

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
        console.error("[POST /features] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create feature";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

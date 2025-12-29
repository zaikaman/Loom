import { NextRequest, NextResponse } from "next/server";
import { getThread, updateThread, deleteThread, ForumsThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { getMe } from "@/lib/forums";

interface RoadmapExtendedData {
    type: "roadmap";
    status: "planned" | "in-progress" | "shipped";
    visibility: "public" | "private";
    description?: string;
    followers?: string[];
    ownerId?: string;
}

// GET /api/roadmaps/[id] - Get a single roadmap
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const thread = await getThread(id);

        const extendedData = thread.extendedData as RoadmapExtendedData | undefined;

        // Check if current user is the owner
        let isOwner = false;
        try {
            const token = await getSession();
            if (token) {
                const user = await getMe(token);
                // Check ownerId in extendedData or userId on thread
                const threadUserId = (thread as unknown as { userId?: string }).userId;
                isOwner = user.id === extendedData?.ownerId || user.id === threadUserId;
            }
        } catch {
            // Not logged in or session error, user is not owner
        }

        return NextResponse.json({
            roadmap: {
                id: thread.id,
                title: thread.title,
                body: thread.body,
                description: extendedData?.description || thread.body,
                status: extendedData?.status || "planned",
                visibility: extendedData?.visibility || "public",
                followers: extendedData?.followers || [],
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
            },
            isOwner,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Roadmap not found";
        return NextResponse.json({ error: message }, { status: 404 });
    }
}

// PUT /api/roadmaps/[id] - Update a roadmap
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
        const { id } = await params;
        const body = await request.json();
        const { title, description, status, visibility } = body;

        // First get the existing thread to merge extendedData
        const existing = await getThread(id);
        const existingExtended = existing.extendedData as RoadmapExtendedData | undefined;

        const newExtendedData: RoadmapExtendedData = {
            type: "roadmap",
            status: status || existingExtended?.status || "planned",
            visibility: visibility || existingExtended?.visibility || "public",
            description: description !== undefined ? description : existingExtended?.description,
            followers: existingExtended?.followers || [],
        };

        const thread = await updateThread(
            id,
            {
                title: title || existing.title,
                body: description || existing.body,
                extendedData: newExtendedData as unknown as Record<string, unknown>,
            },
            user.id
        );

        return NextResponse.json({
            roadmap: {
                id: thread.id,
                title: thread.title,
                description: newExtendedData.description,
                status: newExtendedData.status,
                visibility: newExtendedData.visibility,
                updatedAt: thread.updatedAt,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update roadmap";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/roadmaps/[id] - Delete a roadmap
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;
        await deleteThread(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete roadmap";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

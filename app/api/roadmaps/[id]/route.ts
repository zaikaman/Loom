import { NextRequest, NextResponse } from "next/server";
import { getThread, updateThread, deleteThread, forumsRequest, ForumsThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { getMe } from "@/lib/forums";
import { RoadmapExtendedData } from "@/lib/types";

// Helper to check user's role in the roadmap
function getUserRole(
    userId: string,
    extendedData: RoadmapExtendedData | undefined,
    threadOwnerId?: string
): "owner" | "editor" | "viewer" | null {
    // Check if user is the owner
    if (extendedData?.ownerId === userId || threadOwnerId === userId) {
        return "owner";
    }

    // Check if user is in the team
    const teamMember = extendedData?.team?.find(
        (m) => m.userId === userId && m.status === "accepted"
    );

    return teamMember?.role || null;
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
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        // Check if current user has permissions
        let isOwner = false;
        let isTeamMember = false;
        let userRole: "owner" | "editor" | "viewer" | null = null;

        try {
            const token = await getSession();
            if (token) {
                const user = await getMe(token);
                userRole = getUserRole(user.id, extendedData, threadOwnerId);
                isOwner = userRole === "owner";
                isTeamMember = userRole !== null;
            }
        } catch {
            // Not logged in or session error
        }

        // Get team member count
        const teamCount = (extendedData?.team?.length || 0) + 1; // +1 for owner

        return NextResponse.json({
            roadmap: {
                id: thread.id,
                title: thread.title,
                body: thread.body,
                description: extendedData?.description || thread.body,
                status: extendedData?.status || "planned",
                visibility: extendedData?.visibility || "public",
                createdAt: thread.createdAt,
                updatedAt: thread.updatedAt,
                teamCount,
            },
            isOwner,
            isTeamMember,
            userRole,
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
        const threadOwnerId = (existing as unknown as { userId?: string }).userId;

        // Check if user has permission to edit
        const userRole = getUserRole(user.id, existingExtended, threadOwnerId);

        if (userRole !== "owner" && userRole !== "editor") {
            return NextResponse.json(
                { error: "You don't have permission to edit this roadmap" },
                { status: 403 }
            );
        }

        // Only owner can change visibility
        if (visibility && userRole !== "owner") {
            return NextResponse.json(
                { error: "Only the owner can change visibility" },
                { status: 403 }
            );
        }

        const newExtendedData: RoadmapExtendedData = {
            type: "roadmap",
            status: status || existingExtended?.status || "planned",
            visibility: visibility || existingExtended?.visibility || "public",
            description: description !== undefined ? description : existingExtended?.description,
            ownerId: existingExtended?.ownerId,
            team: existingExtended?.team || [],
            features: existingExtended?.features || [],
        };

        // Use API key for update to ensure it works for team members
        const thread = await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${id}`,
            body: {
                title: title || existing.title,
                body: description || existing.body,
                extendedData: newExtendedData as unknown as Record<string, unknown>,
            },
        });

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

        const user = await getMe(token);
        const { id } = await params;

        // Check if user is the owner
        const existing = await getThread(id);
        const existingExtended = existing.extendedData as RoadmapExtendedData | undefined;
        const threadOwnerId = (existing as unknown as { userId?: string }).userId;

        const userRole = getUserRole(user.id, existingExtended, threadOwnerId);

        if (userRole !== "owner") {
            return NextResponse.json(
                { error: "Only the owner can delete this roadmap" },
                { status: 403 }
            );
        }

        await deleteThread(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete roadmap";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

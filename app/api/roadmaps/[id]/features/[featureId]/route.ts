import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { deletePost, getThread, getMe, forumsRequest, ForumsThread } from "@/lib/forums";
import { RoadmapExtendedData } from "@/lib/types";

// Helper to check permissions (duplicated from team/route.ts, might consider extracting to a shared utility later)
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

export async function DELETE(
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

        // Verify permissions
        // We need to check if the user is the owner of the roadmap OR the author of the post (feature)
        // Since we don't have easy access to the post author without fetching it, 
        // we'll primarily rely on roadmap ownership/editorship for now.
        // Ideally, we should fetch the post to check authorship, but let's start with roadmap permissions.

        const thread = await getThread(roadmapId);
        const extendedData = thread.extendedData as unknown as RoadmapExtendedData;
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        const userRole = getUserRole(user.id, extendedData, threadOwnerId);

        // Owners and Editors should be able to delete features
        if (userRole !== "owner" && userRole !== "editor") {
            // TODO: Also allow the creator of the feature to delete it?
            // For now, restrict to team members
            return NextResponse.json(
                { error: "You do not have permission to delete features from this roadmap" },
                { status: 403 }
            );
        }

        // Update extendedData to remove the feature
        // We use the API Key (by not passing token to forumsRequest) to ensure we have permission
        if (extendedData.features) {
            const updatedFeatures = extendedData.features.filter(f => f.id !== featureId);

            await forumsRequest<ForumsThread>({
                method: "PUT",
                path: `/api/v1/thread/${roadmapId}`,
                body: {
                    extendedData: {
                        ...extendedData,
                        features: updatedFeatures,
                    },
                },
                // No token, use API Key for admin access
            });
        }

        // Delete the post itself
        // Pass undefined for token to use API Key (Admin) permissions instead of User permissions
        // This solves the "No permission to delete this post" error when the user isn't the author
        await deletePost(featureId, undefined);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /features/[id]] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to delete feature";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

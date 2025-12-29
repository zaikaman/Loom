import { NextRequest, NextResponse } from "next/server";
import { getThread, getMe, getUser, forumsRequest, ForumsThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { RoadmapExtendedData, TeamMember } from "@/lib/types";

// Helper to check if user is owner or team member with specific roles
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

// GET /api/roadmaps/[id]/team - List team members
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: roadmapId } = await params;

        // Get current user
        const token = await getSession();
        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const thread = await getThread(roadmapId);
        const extendedData = thread.extendedData as unknown as RoadmapExtendedData | undefined;
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        // Check if user has permission to view team
        const userRole = getUserRole(user.id, extendedData, threadOwnerId);

        // Only owner and team members can view team details
        if (!userRole) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const team = extendedData?.team || [];

        // Add owner to team list if not already there
        const ownerInTeam = team.find((m) => m.role === "owner");
        let fullTeam = [...team];

        if (!ownerInTeam && (extendedData?.ownerId || threadOwnerId)) {
            const ownerId = extendedData?.ownerId || threadOwnerId;
            if (ownerId) {
                try {
                    const owner = await getUser(ownerId);
                    fullTeam = [
                        {
                            userId: owner.id,
                            username: owner.username,
                            displayName: owner.displayName,
                            role: "owner" as const,
                            invitedAt: thread.createdAt,
                            status: "accepted" as const,
                        },
                        ...team,
                    ];
                } catch {
                    // Owner user not found, continue without
                }
            }
        }

        return NextResponse.json({
            team: fullTeam,
            userRole,
        });
    } catch (error) {
        console.error("[GET /team] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch team";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/roadmaps/[id]/team - Invite a user to the team
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
        const { userId: inviteeId, username, role = "editor" } = body;

        if (!inviteeId && !username) {
            return NextResponse.json(
                { error: "Either userId or username is required" },
                { status: 400 }
            );
        }

        if (role !== "editor" && role !== "viewer") {
            return NextResponse.json(
                { error: "Role must be 'editor' or 'viewer'" },
                { status: 400 }
            );
        }

        // Get the roadmap thread
        const thread = await getThread(roadmapId);
        const extendedData = (thread.extendedData as unknown as RoadmapExtendedData) || {
            type: "roadmap" as const,
            status: "planned" as const,
            visibility: "private" as const,
        };
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        // Only owner can invite team members
        const userRole = getUserRole(user.id, extendedData, threadOwnerId);
        if (userRole !== "owner") {
            return NextResponse.json(
                { error: "Only the owner can invite team members" },
                { status: 403 }
            );
        }

        // Get the invitee user
        let invitee;
        try {
            if (inviteeId) {
                invitee = await getUser(inviteeId);
            } else {
                // Search by username - we'll need to get the user by username
                // For now, we expect the frontend to pass userId after searching
                return NextResponse.json(
                    { error: "Please provide userId (search users first)" },
                    { status: 400 }
                );
            }
        } catch {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already in team
        const existingTeam = extendedData.team || [];
        const alreadyInTeam = existingTeam.find((m) => m.userId === invitee.id);
        if (alreadyInTeam) {
            return NextResponse.json(
                { error: "User is already a team member" },
                { status: 400 }
            );
        }

        // Can't invite yourself
        if (invitee.id === user.id) {
            return NextResponse.json(
                { error: "You cannot invite yourself" },
                { status: 400 }
            );
        }

        // Add the new team member
        const newTeamMember: TeamMember = {
            userId: invitee.id,
            username: invitee.username,
            displayName: invitee.displayName,
            role,
            invitedAt: new Date().toISOString(),
            status: "accepted", // For now, auto-accept invitations
        };

        const updatedTeam = [...existingTeam, newTeamMember];

        // Update the thread
        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...extendedData,
                    team: updatedTeam,
                },
            },
        });

        console.log("[POST /team] Added team member:", invitee.username, "with role:", role);

        return NextResponse.json({
            member: newTeamMember,
            message: "Team member added successfully",
        }, { status: 201 });
    } catch (error) {
        console.error("[POST /team] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to add team member";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// DELETE /api/roadmaps/[id]/team - Remove a team member
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
        const { id: roadmapId } = await params;
        const { searchParams } = new URL(request.url);
        const memberUserId = searchParams.get("userId");

        if (!memberUserId) {
            return NextResponse.json(
                { error: "userId query parameter is required" },
                { status: 400 }
            );
        }

        // Get the roadmap thread
        const thread = await getThread(roadmapId);
        const extendedData = (thread.extendedData as unknown as RoadmapExtendedData) || {
            type: "roadmap" as const,
            status: "planned" as const,
            visibility: "private" as const,
        };
        const threadOwnerId = (thread as unknown as { userId?: string }).userId;

        // Check permissions - owner can remove anyone, members can remove themselves
        const userRole = getUserRole(user.id, extendedData, threadOwnerId);
        const isSelf = memberUserId === user.id;

        if (userRole !== "owner" && !isSelf) {
            return NextResponse.json(
                { error: "Only the owner can remove team members" },
                { status: 403 }
            );
        }

        // Cannot remove the owner
        if (memberUserId === extendedData.ownerId || memberUserId === threadOwnerId) {
            return NextResponse.json(
                { error: "Cannot remove the owner from the team" },
                { status: 400 }
            );
        }

        // Remove the team member
        const existingTeam = extendedData.team || [];
        const updatedTeam = existingTeam.filter((m) => m.userId !== memberUserId);

        if (updatedTeam.length === existingTeam.length) {
            return NextResponse.json(
                { error: "Team member not found" },
                { status: 404 }
            );
        }

        // Update the thread
        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...extendedData,
                    team: updatedTeam,
                },
            },
        });

        console.log("[DELETE /team] Removed team member:", memberUserId);

        return NextResponse.json({
            success: true,
            message: "Team member removed successfully",
        });
    } catch (error) {
        console.error("[DELETE /team] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to remove team member";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

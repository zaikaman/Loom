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
        const { features: rawFeatures } = body;

        if (!Array.isArray(rawFeatures) || rawFeatures.length === 0) {
            return NextResponse.json({ error: "Features array is required" }, { status: 400 });
        }

        // Validate basic structure
        for (const f of rawFeatures) {
            if (!f.title) {
                return NextResponse.json({ error: "All features must have a title" }, { status: 400 });
            }
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

        console.log(`[POST /mass] Creating ${rawFeatures.length} features for roadmap:`, roadmapId);

        const newFeatures: Feature[] = [];
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        // Process sequentially to be safe with DB/API limits
        for (const f of rawFeatures) {
            const { title, description, status = "planned" } = f;

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

            newFeatures.push(newFeature);

            // Trigger AI Triage (fire and forget)
            fetch(`${baseUrl}/api/webhooks/triage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: `${title}\n${description || ""}`,
                    resourceId: post.id,
                    resourceType: "feature",
                    parentId: roadmapId,
                }),
            }).catch(err => console.error("Failed to trigger triage for mass feature:", err));
        }

        // Update the roadmap thread's extendedData to include these features
        const existingFeatures = threadExtended.features || [];
        const allFeatures = [...existingFeatures, ...newFeatures];

        console.log("[POST /mass] Updating thread extendedData with total features:", allFeatures.length);

        // Use API key to ensure team members can update
        await forumsRequest<ForumsThread>({
            method: "PUT",
            path: `/api/v1/thread/${roadmapId}`,
            body: {
                extendedData: {
                    ...threadExtended,
                    features: allFeatures,
                },
            },
        });

        return NextResponse.json({
            count: newFeatures.length,
            features: newFeatures
        }, { status: 201 });

    } catch (error) {
        console.error("[POST /mass] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create features";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

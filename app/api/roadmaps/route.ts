import { NextRequest, NextResponse } from "next/server";
import { forumsRequest, ForumsThread, getMe, getThread } from "@/lib/forums";
import { getSession } from "@/lib/session";
import { getUserIndexThreadId, updateUserThreadsMap } from "@/lib/cloudinary";

import { RoadmapExtendedData } from "@/lib/types";

import { createIndexThread, updateIndexThread, IndexExtendedData } from "@/lib/roadmaps";

// GET /api/roadmaps - List all roadmaps for the current user
export async function GET(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const indexThreadId = await getUserIndexThreadId(user.id);

        console.log("[GET /api/roadmaps] User:", user.id, "Index thread:", indexThreadId);

        if (!indexThreadId) {
            console.log("[GET /api/roadmaps] No index thread for user");
            return NextResponse.json({ roadmaps: [] });
        }

        // Fetch the index thread
        let indexThread: ForumsThread;
        try {
            indexThread = await getThread(indexThreadId);
        } catch {
            console.log("[GET /api/roadmaps] Index thread not found");
            return NextResponse.json({ roadmaps: [] });
        }

        // Verify ownership - only show roadmaps if the index thread belongs to this user
        const indexData = indexThread.extendedData as IndexExtendedData | undefined;
        // TRUST Cloudinary mapping: If the index thread is mapped to this user, we use it.
        // We do NOT check thread.userId because index threads might be created by System/Admin or Inviter.

        // const indexOwnerId = (indexThread as unknown as { userId?: string }).userId;
        // if (indexOwnerId && indexOwnerId !== user.id) {
        //     console.log("[GET /api/roadmaps] Index thread belongs to different user:", indexOwnerId);
        //     return NextResponse.json({ roadmaps: [] });
        // }

        const roadmapIds = indexData?.roadmapIds || [];

        console.log("[GET /api/roadmaps] Roadmap IDs:", roadmapIds);

        if (roadmapIds.length === 0) {
            return NextResponse.json({ roadmaps: [] });
        }

        // Fetch all roadmaps by ID
        const roadmaps = await Promise.all(
            roadmapIds.map(async (id) => {
                try {
                    const thread = await getThread(id);
                    const extendedData = thread.extendedData as unknown as RoadmapExtendedData | undefined;
                    return {
                        id: thread.id,
                        title: thread.title,
                        description: extendedData?.description || thread.body || "",
                        status: extendedData?.status || "planned",
                        visibility: extendedData?.visibility || "public",
                        lastUpdated: thread.createdAt,
                        featureCount: extendedData?.features?.length || 0,
                        team: extendedData?.team || [],
                        links: extendedData?.links,
                        aiAnalysis: extendedData?.aiAnalysis,
                    };
                } catch {
                    return null;
                }
            })
        );

        const validRoadmaps = roadmaps.filter((r) => r !== null);
        console.log("[GET /api/roadmaps] Valid roadmaps:", validRoadmaps.length);

        return NextResponse.json({ roadmaps: validRoadmaps });
    } catch (error) {
        console.error("[GET /api/roadmaps] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch roadmaps";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST /api/roadmaps - Create a new roadmap
export async function POST(request: NextRequest) {
    try {
        const token = await getSession();

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await getMe(token);
        const body = await request.json();
        const { title, description, visibility = "public", links } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        console.log("[POST /api/roadmaps] Creating for user:", user.id);

        // Create the roadmap thread
        const roadmapExtendedData: RoadmapExtendedData = {
            type: "roadmap",
            status: "planned",
            visibility,
            description,
            followers: [],
            ownerId: user.id,
            links,
        };

        const thread = await forumsRequest<ForumsThread>({
            method: "POST",
            path: "/api/v1/thread",
            body: {
                title,
                body: description || "",
                userId: user.id,
                extendedData: roadmapExtendedData as unknown as Record<string, unknown>,
            },
            token,
        });

        console.log("[POST /api/roadmaps] Roadmap thread created:", thread.id);

        // Get or create the index thread (from Cloudinary)
        let indexThreadId = await getUserIndexThreadId(user.id);
        let currentIds: string[] = [];

        if (!indexThreadId) {
            // Create new index thread
            const indexThread = await createIndexThread(user.id, token, thread.id);
            indexThreadId = indexThread.id;
        } else {
            // Fetch current IDs from existing index thread
            try {
                const indexThread = await getThread(indexThreadId);
                const indexData = indexThread.extendedData as IndexExtendedData | undefined;
                currentIds = indexData?.roadmapIds || [];

                // Update index thread with new roadmap ID
                const newIds = [...currentIds, thread.id];
                await updateIndexThread(indexThreadId, newIds, token);
            } catch {
                // Index thread was deleted, create new one
                const indexThread = await createIndexThread(user.id, token, thread.id);
                indexThreadId = indexThread.id;
            }
        }

        const response = NextResponse.json({
            roadmap: {
                id: thread.id,
                title: thread.title,
                description: roadmapExtendedData.description,
                status: roadmapExtendedData.status,
                visibility: roadmapExtendedData.visibility,
                createdAt: thread.createdAt,
                links: roadmapExtendedData.links,
            }
        }, { status: 201 });

        // Trigger AI Triage (Fire and forget, or await to ensure it runs in this env)
        // detailed hackathon note: using await to ensure it completes in serverless dev env
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        console.log(`[POST /api/roadmaps] Triggering AI triage for Roadmap ${thread.id}`);

        fetch(`${baseUrl}/api/webhooks/triage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: `${title}\n${description || ""}`,
                resourceId: thread.id,
                resourceType: "roadmap",
            }),
        }).catch(err => console.error("Failed to trigger triage:", err));

        return response;

    } catch (error) {
        console.error("[POST /api/roadmaps] Error:", error);
        const message = error instanceof Error ? error.message : "Failed to create roadmap";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

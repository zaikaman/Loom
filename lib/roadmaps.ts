import { forumsRequest, ForumsThread } from "@/lib/forums";
import { updateUserThreadsMap } from "@/lib/cloudinary";

export interface IndexExtendedData {
    type: "loom-index";
    roadmapIds: string[];
}

// Create an index thread for a user (System operation)
export async function createIndexThread(userId: string, token?: string, initialRoadmapId?: string): Promise<ForumsThread> {
    console.log("[createIndexThread] Creating for user:", userId);

    const roadmapIds = initialRoadmapId ? [initialRoadmapId] : [];

    const extendedData: IndexExtendedData = {
        type: "loom-index",
        roadmapIds,
    };

    // Use API Key (System) if no token provided, or even if token provided?
    // We should prefer System access for Index Threads to avoid ownership issues.
    // So we will NOT pass the token to forumsRequest, forcing API Key usage.

    const thread = await forumsRequest<ForumsThread>({
        method: "POST",
        path: "/api/v1/thread",
        body: {
            title: `Loom Index`,
            body: "System thread for storing user roadmap references",
            userId,
            extendedData: extendedData as unknown as Record<string, unknown>,
        },
        // token, // Intentionally omitted to use API Key
    });

    console.log("[createIndexThread] Created:", thread.id);
    await updateUserThreadsMap(userId, thread.id);

    return thread;
}

// Update the index thread with new roadmap IDs (System operation)
export async function updateIndexThread(
    threadId: string,
    roadmapIds: string[],
    token?: string
): Promise<void> {
    console.log("[updateIndexThread] Updating:", threadId, "IDs:", roadmapIds);

    const extendedData: IndexExtendedData = {
        type: "loom-index",
        roadmapIds,
    };

    // Use API Key (System)
    await forumsRequest<ForumsThread>({
        method: "PUT",
        path: `/api/v1/thread/${threadId}`,
        body: {
            extendedData: extendedData as unknown as Record<string, unknown>,
        },
        // token, // Intentionally omitted to use API Key
    });

    console.log("[updateIndexThread] Updated successfully");
}

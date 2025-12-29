import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/ai";
import { getThread, updateThread, forumsRequest, ForumsThread } from "@/lib/forums";
import { RoadmapExtendedData, Feature } from "@/lib/types";

// Internal "webhook" to avoid slowing down user requests
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, resourceId, resourceType, parentId } = body;

        // Verify some simple secret or just rely on being internal (Next.js API routes are same-origin by default for browser, but server-to-server needs care. 
        // For this Hackathon demo, we'll assume it's called internally or just public.)

        console.log(`[Triage Webhook] Analyzing ${resourceType} ${resourceId}`);

        const analysis = await analyzeContent(text, resourceType === "roadmap" ? "Roadmap" : "Feature");
        console.log(`[Triage Webhook] Analysis result:`, analysis);

        if (resourceType === "roadmap") {
            // Update Roadmap Thread
            const thread = await getThread(resourceId);
            const extendedData = thread.extendedData as unknown as RoadmapExtendedData;

            await forumsRequest<ForumsThread>({
                method: "PUT",
                path: `/api/v1/thread/${resourceId}`,
                body: {
                    extendedData: {
                        ...extendedData,
                        aiAnalysis: analysis
                    }
                }
            });
        } else if (resourceType === "feature") {
            // Update Feature in Roadmap Thread
            if (!parentId) throw new Error("Parent Roadmap ID required for feature triage");

            const thread = await getThread(parentId);
            const extendedData = thread.extendedData as unknown as RoadmapExtendedData;
            const features = extendedData.features || [];

            const featureIndex = features.findIndex(f => f.id === resourceId);
            if (featureIndex === -1) {
                console.error(`[Triage Webhook] Feature ${resourceId} not found in Roadmap ${parentId}`);
                return NextResponse.json({ error: "Feature not found" }, { status: 404 });
            }

            features[featureIndex] = {
                ...features[featureIndex],
                aiAnalysis: analysis
            };

            await forumsRequest<ForumsThread>({
                method: "PUT",
                path: `/api/v1/thread/${parentId}`,
                body: {
                    extendedData: {
                        ...extendedData,
                        features
                    }
                }
            });
        }

        return NextResponse.json({ success: true, analysis });
    } catch (error) {
        console.error("[Triage Webhook] Error:", error);
        return NextResponse.json({ error: "Failed to triage" }, { status: 500 });
    }
}

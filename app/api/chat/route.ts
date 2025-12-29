import { type NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getSession } from "@/lib/session";
import { getMe, getThread } from "@/lib/forums";
import { getUserIndexThreadId } from "@/lib/cloudinary";
import { IndexExtendedData } from "@/lib/roadmaps";
import { RoadmapExtendedData, Feature } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // 1. Authenticate
        const token = await getSession();
        if (!token) {
            return new Response("Unauthorized", { status: 401 });
        }
        const user = await getMe(token);

        // 2. Fetch User Context (Roadmaps + Features)
        let contextText = "User has no roadmaps yet.";

        try {
            const indexThreadId = await getUserIndexThreadId(user.id);
            if (indexThreadId) {
                const indexThread = await getThread(indexThreadId);
                const roadmapIds = (indexThread.extendedData as unknown as IndexExtendedData)?.roadmapIds || [];

                if (roadmapIds.length > 0) {
                    const roadmaps = await Promise.all(
                        roadmapIds.map(async (id: string) => {
                            try {
                                const t = await getThread(id);
                                const data = t.extendedData as unknown as RoadmapExtendedData;

                                // Format features
                                const featuresList = data.features?.map((f: Feature) =>
                                    `- "${f.title}" (${f.status}, ${f.votes} votes): ${f.description}`
                                ).join("\n") || "No features yet.";

                                return `
Roadmap: ${t.title} (Status: ${data.status})
Description: ${data.description || t.body}
Features:
${featuresList}
-------------------`;
                            } catch (e) {
                                return null;
                            }
                        })
                    );

                    contextText = `Here is the user's current roadmap context:\n\n${roadmaps.filter(Boolean).join("\n")}`;
                }
            }
        } catch (error) {
            console.error("Error fetching context:", error);
            // Continue without context
        }

        // 3. Define System Prompt
        const systemPrompt = `
You are LoomAI, an intelligent assistant for "Loom", a product roadmap tool.
You are talking to ${user.displayName || user.username}.

Your goal is to help them manage their product roadmaps, brainstorm features, and prioritize work.

${contextText}

Guidelines:
- Be concise, professional, and helpful.
- Refer to specific roadmaps and features by name when possible.
- If suggesting new features, check if they duplicate existing ones in the context.
- You can offer to draft descriptions or changelogs.
`.trim();

        // 4. Client Setup (Azure or Standard)
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.OPENAI_BASE_URL;
        const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview';
        const deployment = process.env.OPENAI_MODEL || 'gpt-4o'; // Azure deployment name

        // Check if we are using Azure or Standard OpenAI
        // The user has OPENAI_BASE_URL set, which might be Azure format.
        // If it contains "openai.azure.com", it's Azure.
        const isAzure = azureEndpoint?.includes('openai.azure.com');

        let client: OpenAI;

        if (isAzure) {
            client = new OpenAI({
                apiKey: apiKey,
                baseURL: `${azureEndpoint}/openai/deployments/${deployment}`, // Azure specific construction if not already full path
                defaultQuery: { 'api-version': apiVersion },
                defaultHeaders: { 'api-key': apiKey },
            });
        } else {
            // Fallback to standard instantiation if standard auth used
            client = new OpenAI({
                apiKey: apiKey,
                baseURL: azureEndpoint, // if custom standard URL
            });
        }

        // Simpler: Just use standard instantiation with baseURL/apiKey.
        // Verify: For Azure, typically you use `baseURL` + `defaultQuery` + `defaultHeaders` OR just `azureOpenAIApiKey` + `azureEndpoint`.
        // Let's use the explicit 'AzureOpenAI' class if available? No, official SDK unifies it now?
        // Actually, the official library supports Azure via specific constructor options.

        // Re-Config for Azure using official supported way if we can detect it.
        // But to be safe given the user's messy env, let's try a generic client that respects the BASE_URL.
        // User likely has: OPENAI_BASE_URL="https://NAME.openai.azure.com/"
        // and OPENAI_API_KEY="KEY"

        const finalClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });

        const stream = await finalClient.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
            stream: true,
        });

        // 5. Return Readable Stream
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        console.error("Cause:", error.cause);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}

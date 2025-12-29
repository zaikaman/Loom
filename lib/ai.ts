import OpenAI from "openai";
import { AIAnalysis } from "./types";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
});

export async function analyzeContent(
    text: string,
    type: "Roadmap" | "Feature"
): Promise<AIAnalysis> {
    const prompt = `
A Product Manager Assistant needs to triage a new ${type}.
Analyze the following text and provide a JSON response with:
- sentiment: "Angry", "Excited", or "Neutral"
- type: "Bug", "Feature", or "Enhancement"
- impactScore: Number 1-10 (How valuable is this?)
- effortScore: Number 1-10 (How hard is this to build? 1=easy, 10=hard)
- reasoning: A short sentence explaining the scores.

Text: "${text}"

Response format (JSON only):
{
  "sentiment": "...",
  "type": "...",
  "impactScore": ...,
  "effortScore": ...,
  "reasoning": "..."
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-5-nano",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from AI");

        const result = JSON.parse(content);
        return {
            sentiment: result.sentiment,
            type: result.type,
            impactScore: result.impactScore,
            effortScore: result.effortScore,
            reasoning: result.reasoning,
        };
    } catch (error) {
        console.error("AI Analysis failed:", error);
        // Fallback
        return {
            sentiment: "Neutral",
            type: "Enhancement",
            impactScore: 5,
            effortScore: 5,
            reasoning: "AI Analysis failed, setting defaults.",
        };
    }
}

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
    try {
        const { title } = await req.json();

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        const prompt = `
You are an expert Product Manager. 
Create a concise but comprehensive Product Requirement Doc (PRD) for a feature titled: "${title}".

The output must be in strict Markdown format.
IMPORTANT: Use double newlines (\n\n) to separate all sections and paragraphs.

Structure:
# ${title} PRD

## User Stories
- As a [role], I want [feature], so that [benefit].
(Provide 2-3 key stories)

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Edge Cases
- Case 1
- Case 2

Keep it practical and directly usable for developers. Do not include introductory filler text.
`;

        const { text } = await generateText({
            model: openai("gpt-5-nano"), // Using a capable model for reasoning
            prompt: prompt,
        });

        return NextResponse.json({ spec: text });
    } catch (error) {
        console.error("[API] Spec Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate spec" },
            { status: 500 }
        );
    }
}

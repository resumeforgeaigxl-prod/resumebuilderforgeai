import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, language, context } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'AI service configuration missing' }, { status: 500 });
        }

        const prompt = `
You are a senior technical interviewer.
Explain the solution in a LeetCode-style format.

Return ONLY markdown using these exact H2 headings in this exact order:

## Problem Understanding
## Intuition
## Algorithm Steps
## Code Explanation
## Example Walkthrough
## Time Complexity
## Space Complexity
## Edge Cases
## Interview Follow-Up Questions

Formatting rules:
- Use clear bullet points under each section.
- Keep each section concise and readable.
- In "Code Explanation", include exactly one fenced code block with language tag "${language || 'text'}".
- Keep code blocks separate from explanatory bullets.
- Do not add extra sections.

Candidate Code:
\`\`\`${language || 'text'}
${code}
\`\`\`

${context ? `Problem Context: ${context}` : ''}
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://resumeforge.ai",
                "X-Title": "ResumeForgeAI CodingForge",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenRouter Error:', error);
            return NextResponse.json({ error: 'AI explanation failed' }, { status: 500 });
        }

        const data = await response.json();
        const explanation = data.choices[0].message.content;

        return NextResponse.json({ explanation });

    } catch (e) {
        console.error('AI Explain API Error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

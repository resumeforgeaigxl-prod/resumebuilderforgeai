import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, language, context, mode = 'explain' } = body;

        // Smart Mode: Truncate inputs to save tokens (max ~1500 tokens for code)
        const truncatedCode = code?.slice(0, 5000) || ''; 
        const truncatedContext = context?.slice(0, 1000) || '';

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'AI service configuration missing' }, { status: 500 });
        }

        let prompt = '';
        if (mode === 'summarize' && !truncatedCode) {
            prompt = `
You are a senior technical interviewer. 
Summarize the following coding problem clearly and concisely for a candidate.
Focus on:
1. Core objective.
2. Key constraints.
3. Common pitfalls.

Problem:
${truncatedContext}

Return ONLY markdown. No conversational filler.
            `;
        } else {
            prompt = `
You are a senior technical interviewer.
Explain the solution in a LeetCode-style structure.

Return ONLY markdown using these headings:
## Problem Understanding
## Intuition & Approach
## Code Walkthrough
## Complexity Analysis (Time & Space)
## Edge Cases & Tips

Formatting rules:
- Use bullet points.
- Ensure any code inside the explanation is wrapped in \`fenced code blocks\`.
- Use ${language || 'text'} for code syntax highlighting.

${truncatedCode ? `Candidate Code Segment:
\`\`\`${language || 'text'}
${truncatedCode}
\`\`\`` : ''}

${truncatedContext ? `Problem Context: ${truncatedContext}` : ''}
            `;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://resumeforgeai.in",
                "X-Title": "ResumeForgeAI CodingForge",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "system", "content": "You provide concise, high-utility technical explanations. You never use placeholders." },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.3 // Lower temperature for more consistent technical output
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

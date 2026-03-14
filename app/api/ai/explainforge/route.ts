import { NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { logUsage } from '@/lib/usage';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are ExplainForge AI, a elite technical explanation engine. 
Your goal is to analyze user projects and generate human-style explanations and professional documentation.

Outputs required in JSON format:
1. humanExplanation: A natural, friendly, non-robotic explanation of the project. Imagine explaining it to a peer.
2. interviewExplanation: A professional, impact-oriented explanation suitable for a job interview (STAR method where applicable).
3. vivaExplanation: A technical, conceptual explanation focusing on 'how' and 'why' for academic vivas.
4. fullReport: An object with the following sections (content in markdown):
   - Abstract
   - Introduction
   - ProblemStatement
   - SystemArchitecture
   - Modules
   - AlgorithmsUsed
   - Technologies
   - Conclusion
   - FutureScope
5. diagrams: An object with Mermaid.js diagram definitions:
   - architecture (System Architecture)
   - flowchart (Workflow Flowchart)
   - dfd (Data Flow Diagram)
   - sequence (Sequence Diagram)
6. algorithms: An array of objects { name: string, explanation: string } for any logic/algorithms used.
7. questions: An array of 5 potential interview/viva questions with professional answers.

Guidelines:
- Avoid generic AI phrases like "In summary" or "This project aims to".
- For diagrams, return VALID Mermaid.js code strings.
- Be technical but accessible.
- If a GitHub URL or file names are provided, incorporate them into the analysis.`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please login to use ExplainForge AI." }, { status: 401 });
        }

        const body = await req.json();
        const { description, githubUrl, fileCount, fileNames, fileUrls } = body;

        const supabase = createClient();

        // 1. Insert search request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: request, error: reqError } = await (supabase as any)
            .from('explainforge_requests')
            .insert({
                user_id: session.userId,
                input_type: fileCount > 0 ? 'file' : githubUrl ? 'github' : 'description',
                input_content: description || null,
                github_url: githubUrl || null,
            })
            .select()
            .single();

        if (reqError) throw reqError;

        // 2. Handle files if any
        if (fileUrls && fileUrls.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('explainforge_files')
                .insert(fileUrls.map((url: string, i: number) => ({
                    request_id: request.id,
                    file_name: fileNames[i] || 'unnamed_file',
                    file_url: url,
                    file_type: url.split('.').pop() || 'unknown'
                })));
        }

        // 3. Run AI analysis
        console.log('[ExplainForge] Starting AI analysis...');
        const prompt = `Project Analysis Input:
Description: ${description || 'No description provided'}
GitHub: ${githubUrl || 'N/A'}
Files Provided: ${fileCount} (${fileNames?.join(', ') || 'None'})

Perform a deep analysis and generate the requested explanations, report, diagrams, and questions.`;

        let response;
        try {
            response = await generateJsonGemini(prompt, SYSTEM_PROMPT);
        } catch (aiError: unknown) {
            console.error('[ExplainForge] AI Analysis Error:', aiError);
            const message = aiError instanceof Error ? aiError.message : 'Unknown error';
            throw new Error(`AI Analysis failed: ${message}`);
        }

        if (!response || !response.humanExplanation) {
            console.error('[ExplainForge] Invalid AI response:', response);
            throw new Error('AI returned an invalid or empty response.');
        }

        // 4. Store AI output
        console.log('[ExplainForge] Storing AI results...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: outError } = await (supabase as any)
            .from('explainforge_outputs')
            .insert({
                request_id: request.id,
                human_explanation: response.humanExplanation,
                interview_explanation: response.interviewExplanation,
                viva_explanation: response.vivaExplanation,
                report_content: response.fullReport,
                diagrams: response.diagrams,
                algorithms: response.algorithms,
                questions: response.questions
            });

        if (outError) {
            console.error('[ExplainForge] Output Storage error:', outError);
            throw new Error(`Database Error (Outputs): ${outError.message}`);
        }

        // 5. Log usage
        console.log('[ExplainForge] Logging usage...');
        await logUsage(session.userId, 'explain_project');

        // Also log to the unified AI monitoring table for the Neural Monitor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('ai_usage_logs')
            .insert({
                user_id: session.userId,
                feature: 'explainforge',
                model: 'gemini-2.0-flash',
                tokens: JSON.stringify(response).length / 4 // estimate
            });

        return NextResponse.json({
            success: true,
            data: response,
            requestId: request.id
        });
    } catch (error) {
        console.error('[ExplainForge API] Global Error:', error);
        return NextResponse.json({
            success: false,
            message: "Failed to materialize the project logic. Please try a more detailed description.",
            debug: error instanceof Error ? error.message : "Unknown Error",
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        const supabase = createClient();

        if (id) {
            // Fetch specific request with output
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('explainforge_requests')
                .select('*, explainforge_outputs(*), explainforge_files(*)')
                .eq('id', id)
                .eq('user_id', session.userId)
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        } else {
            // Fetch history
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('explainforge_requests')
                .select('*, explainforge_outputs(id)')
                .eq('user_id', session.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ success: true, history: data });
        }
    } catch (error) {
        console.error('[ExplainForge GET] Error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch history" }, { status: 500 });
    }
}

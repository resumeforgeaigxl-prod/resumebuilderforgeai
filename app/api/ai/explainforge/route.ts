import { NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { logUsage } from '@/lib/usage';
import JSZip from 'jszip';

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
- If a GitHub URL or file names are provided, incorporate them into the analysis.
- If code snippets are provided, perform a thorough code review and logic analysis.`;

async function fetchAndExtractContent(urls: string[], names: string[]) {
    let combinedContent = "";
    let totalLength = 0;
    const MAX_LENGTH = 100000; // 100k chars limit for better context

    for (let i = 0; i < urls.length; i++) {
        if (totalLength >= MAX_LENGTH) break;

        try {
            const res = await fetch(urls[i]);
            if (!res.ok) continue;
            const buffer = await res.arrayBuffer();
            const name = names[i].toLowerCase();

            if (name.endsWith('.zip')) {
                const zip = await JSZip.loadAsync(buffer);
                const files = Object.keys(zip.files);
                
                for (const filename of files) {
                    if (totalLength >= MAX_LENGTH) break;
                    const file = zip.files[filename];
                    if (file.dir) continue;

                    // Skip common large/binary/unwanted folders
                    if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('.next') || filename.includes('dist') || filename.includes('build')) continue;

                    const ext = filename.split('.').pop()?.toLowerCase();
                    const textExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'sql', 'html', 'css', 'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'env'];
                    
                    if (ext && textExtensions.includes(ext)) {
                        const content = await file.async('string');
                        const snippet = `\n--- File: ${filename} ---\n${content}\n`;
                        combinedContent += snippet;
                        totalLength += snippet.length;
                    }
                }
            } else {
                const ext = name.split('.').pop()?.toLowerCase();
                const textExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'sql', 'html', 'css', 'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'env'];
                
                if (ext && textExtensions.includes(ext)) {
                    const content = new TextDecoder().decode(buffer);
                    const snippet = `\n--- File: ${names[i]} ---\n${content}\n`;
                    combinedContent += snippet;
                    totalLength += snippet.length;
                }
            }
        } catch (err) {
            console.warn(`[ExplainForge] Failed to process file ${names[i]}:`, err);
        }
    }

    return combinedContent;
}

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

        // 3. Extract content for AI
        console.log('[ExplainForge] Extracting file contents...');
        const codeContext = (fileUrls && fileUrls.length > 0) 
            ? await fetchAndExtractContent(fileUrls, fileNames)
            : "";

        // 4. Run AI analysis
        console.log('[ExplainForge] Starting AI analysis...');
        const prompt = `Project Analysis Input:
Description: ${description || 'No description provided'}
GitHub: ${githubUrl || 'N/A'}
Files Provided: ${fileCount} (${fileNames?.join(', ') || 'None'})

${codeContext ? `PROJECT SOURCE CODE CONTEXT:\n${codeContext}\n` : ""}

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
    } catch (error: unknown) {
        console.error('[ExplainForge API] Global Error:', error);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        let errorMessage = "Failed to materialize the project logic.";
        if (err.message?.includes('AI Analysis failed')) {
            errorMessage = "The AI struggled to analyze this project. Try adding more description or source code.";
        } else if (err.message) {
            errorMessage = err.message;
        }

        return NextResponse.json({
            success: false,
            message: errorMessage,
            debug: err.message || "Unknown Error"
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('[ExplainForge GET] Error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch history" }, { status: 500 });
    }
}

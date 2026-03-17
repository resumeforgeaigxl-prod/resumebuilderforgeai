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
- If code snippets are provided, perform a thorough code review and logic analysis.
- OUTPUT ONLY VALID JSON.`;

const SUMMARY_SYSTEM_PROMPT = `You are a technical code analyzer. 
Analyze the provided file content and generate a concise summary.
Return JSON ONLY:
{
  "fileName": "string",
  "purpose": "Primary role of this file in the project",
  "logicSummary": "Concise breakdown of core logic, functions, or algorithms used"
}`;

interface FileObject {
    name: string;
    content: string;
}

interface FileSummary {
    fileName: string;
    purpose: string;
    logicSummary: string;
}

async function fetchFileObjects(urls: string[], names: string[]): Promise<FileObject[]> {
    const fileObjects: FileObject[] = [];
    const MAX_FILES = 20; // Limit for performance
    let processedCount = 0;

    for (let i = 0; i < urls.length; i++) {
        if (processedCount >= MAX_FILES) break;

        try {
            const res = await fetch(urls[i]);
            if (!res.ok) continue;
            const buffer = await res.arrayBuffer();
            const name = names[i].toLowerCase();

            if (name.endsWith('.zip')) {
                const zip = await JSZip.loadAsync(buffer);
                const files = Object.keys(zip.files);
                
                for (const filename of files) {
                    if (processedCount >= MAX_FILES) break;
                    const file = zip.files[filename];
                    if (file.dir) continue;

                    if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('.next') || filename.includes('dist') || filename.includes('build')) continue;

                    const ext = filename.split('.').pop()?.toLowerCase();
                    const textExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'sql', 'html', 'css', 'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'env'];
                    
                    if (ext && textExtensions.includes(ext)) {
                        const content = await file.async('string');
                        fileObjects.push({ name: filename, content: content.slice(0, 10000) }); // Limit individual file size
                        processedCount++;
                    }
                }
            } else {
                const ext = name.split('.').pop()?.toLowerCase();
                const textExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'sql', 'html', 'css', 'txt', 'md', 'json', 'yaml', 'yml', 'xml', 'env'];
                
                if (ext && textExtensions.includes(ext)) {
                    const content = new TextDecoder().decode(buffer);
                    fileObjects.push({ name: names[i], content: content.slice(0, 10000) });
                    processedCount++;
                }
            }
        } catch (err) {
            console.warn(`[ExplainForge] Failed to process file ${names[i]}:`, err);
        }
    }

    return fileObjects;
}

async function summarizeFiles(files: FileObject[]): Promise<FileSummary[]> {
    const summaries: FileSummary[] = [];
    
    // Process in batches of 5 to avoid overloading
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchPromises = batch.map(async (file) => {
            try {
                const prompt = `FILE NAME: ${file.name}\nCONTENT:\n${file.content}`;
                const result = await generateJsonGemini(prompt, SUMMARY_SYSTEM_PROMPT);
                return result as FileSummary;
            } catch (err) {
                console.error(`[ExplainForge] Error summarizing ${file.name}:`, err);
                return { fileName: file.name, purpose: "Error analyzing file", logicSummary: "N/A" };
            }
        });
        
        const results = await Promise.all(batchPromises);
        summaries.push(...results);
    }
    
    return summaries;
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

        // 3. Chunk-based Metadata Extraction
        console.log('[ExplainForge] Extracting file contents...');
        const fileObjects = (fileUrls && fileUrls.length > 0) 
            ? await fetchFileObjects(fileUrls, fileNames)
            : [];

        let aggregatedSummaries = "";
        if (fileObjects.length > 0) {
            console.log(`[ExplainForge] Summarizing ${fileObjects.length} files...`);
            const summaries = await summarizeFiles(fileObjects);
            aggregatedSummaries = summaries.map(s => 
                `File: ${s.fileName}\nPurpose: ${s.purpose}\nLogic: ${s.logicSummary}\n---`
            ).join('\n');
        }

        // 4. Run Final AI Synthesis
        console.log('[ExplainForge] Starting Final AI Synthesis...');
        const prompt = `Project Analysis Request:
Description: ${description || 'No description provided'}
GitHub: ${githubUrl || 'N/A'}
Files Analyzed: ${fileObjects.length}

${aggregatedSummaries ? `PROJECT COMPONENT SUMMARIES:\n${aggregatedSummaries}\n` : ""}

Task: Use the component summaries (and description) to generate a high-level system overview, comprehensive report, Mermaid diagrams, and interview prep.`;

        let response;
        try {
            response = await generateJsonGemini(prompt, SYSTEM_PROMPT);
        } catch (aiError: unknown) {
            console.error('[ExplainForge] AI Synthesis Error:', aiError);
            const message = aiError instanceof Error ? aiError.message : 'Unknown error';
            
            // Fallback: Return partial results if synthesis fails but aggregated info exists
            if (aggregatedSummaries) {
                return NextResponse.json({
                    success: true,
                    requestId: request.id,
                    data: {
                        humanExplanation: "I analyzed your project files but encountered an error generating the final report. However, I identified the key components.",
                        interviewExplanation: "Analysis interrupted during synthesis.",
                        vivaExplanation: "Analysis interrupted during synthesis.",
                        fullReport: { Abstract: "Analysis partial.", Technologies: "Processing..." },
                        diagrams: { architecture: "graph TD\n  A[Incomplete Analysis] --> B[Check files]" },
                        algorithms: [],
                        questions: []
                    }
                });
            }
            throw new Error(`AI Synthesis failed: ${message}`);
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

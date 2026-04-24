export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-core/rag-engine';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { logUsage } from '@/lib/usage';
import JSZip from 'jszip';

const SYSTEM_PROMPT = `Analyze this code/project and return a JSON object ONLY.
No intro/outro conversation. No markdown backticks.

STRICT JSON SCHEMA:
{
  "summary": "Human-friendly overview of the project",
  "flowSteps": ["Step 1: ...", "Step 2: ..."],
  "interviewExplanation": "A 3-5 line natural pitch for an interview",
  "questions": ["Likely interview question 1", "..."],
  "answers": ["Sample answer for Q1", "..."],
  "insights": "Key technical takeaways",
  "diagrams": {
    "architecture": "Valid Mermaid.js graph string",
    "flowchart": "Valid Mermaid.js flowchart string"
  }
}`;

/**
 * Safe parser for ExplainForge AI responses.
 */
function safeParseExplainForgeResponse(rawText: string) {
    console.log('[ExplainForge AI] Raw Response Length:', rawText.length);
    
    // 1. Pre-cleaning (Remove common AI garbage)
    const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .replace(/^\s*\{\s*json/gi, '{') // Fix common "json {" prefix
        .trim();

    // 2. Try the clean version first
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.warn('[ExplainForge AI] Primary JSON parse failed. Attempting deep extraction:', err);
        
        try {
            // Find the OUTERMOST curly braces to handle leading/trailing text
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
        } catch (extractErr) {
            console.error('[ExplainForge AI] Regex extraction also failed:', extractErr);
        }

        // 3. Fallback Structure
        return {
            summary: "I analyzed your project but encountered a formatting issue in the deep synthesis. Here is the raw data I captured.",
            flowSteps: ["Overview extraction attempted."],
            interviewExplanation: "This project showcases my technical ability and problem-solving skills. (Raw text processing)",
            questions: ["Can you explain the system architecture?"],
            answers: ["The architecture is designed for scalability using the provided tech stack."],
            insights: "AI returned unstructured output. Try refreshing or adding more specific project details.",
            diagrams: { architecture: "graph TD\n  A[Incomplete] --> B[View Raw Text]" },
            is_fallback: true
        };
    }
}

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
    const MAX_FILES = 20; 
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
                        fileObjects.push({ name: filename, content: content.slice(0, 10000) }); 
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

async function summarizeFiles(files: FileObject[], userId: string): Promise<FileSummary[]> {
    const summaries: FileSummary[] = [];
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchPromises = batch.map(async (file) => {
            try {
                const prompt = `FILE NAME: ${file.name}\nCONTENT:\n${file.content}`;
                const result = await generateAIResponse(prompt, {
                    userId,
                    contextType: 'project',
                    jsonMode: true,
                    systemPrompt: SUMMARY_SYSTEM_PROMPT
                });
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

        const { data: request, error: reqError } = await supabase
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

        if (fileUrls && fileUrls.length > 0) {
            await supabase
                .from('explainforge_files')
                .insert(fileUrls.map((url: string, i: number) => ({
                    request_id: request.id,
                    file_name: fileNames[i] || 'unnamed_file',
                    file_url: url,
                    file_type: url.split('.').pop() || 'unknown'
                })));
        }

        console.log('[ExplainForge] Extracting file contents...');
        const fileObjects = (fileUrls && fileUrls.length > 0) 
            ? await fetchFileObjects(fileUrls, fileNames)
            : [];

        let aggregatedSummaries = "";
        if (fileObjects.length > 0) {
            console.log(`[ExplainForge] Summarizing ${fileObjects.length} files...`);
            const summaries = await summarizeFiles(fileObjects, session.userId);
            aggregatedSummaries = summaries.map(s => 
                `File: ${s.fileName}\nPurpose: ${s.purpose}\nLogic: ${s.logicSummary}\n---`
            ).join('\n');
        }

        console.log('[ExplainForge] Starting Final AI Synthesis (Professional Upgrade)...');
        const prompt = `Project Analysis Request:
Description: ${description || 'No description provided'}
GitHub: ${githubUrl || 'N/A'}
Files Analyzed: ${fileObjects.length}

${aggregatedSummaries ? `PROJECT COMPONENT SUMMARIES:\n${aggregatedSummaries}\n` : ""}

Task: Transform this project into a career-ready interview explanation and human-friendly flow.`;

        let response;
        try {
            const rawResult = await generateAIResponse(prompt, {
                userId: session.userId,
                contextType: 'project',
                jsonMode: true,
                systemPrompt: SYSTEM_PROMPT
            });
            if (typeof rawResult === 'string') {
                response = safeParseExplainForgeResponse(rawResult);
            } else if (rawResult && rawResult.error === "JSON_PARSE_FAILED") {
                response = safeParseExplainForgeResponse(rawResult.reply || "");
            } else {
                response = rawResult;
            }
        } catch (aiError: unknown) {
            console.error('[ExplainForge] AI Synthesis Error:', aiError);
            
            // Return what we have (file list + summarized metadata) to prevent empty UI
            return NextResponse.json({
                success: true,
                requestId: request.id,
                data: {
                    summary: aggregatedSummaries 
                        ? "Deep synthesis was interrupted, but individual components were analyzed. Below is the technical breakdown per module." 
                        : (description || "Synthesis failed. Please try with more specific project context."),
                    flowSteps: aggregatedSummaries ? ["Review individual files in the 'Code Review' tab for logic details."] : ["System flow extraction failed."],
                    interviewExplanation: "I analyzed the project's core files and architecture to understand the underlying logic.",
                    questions: ["How would you describe the project architecture?"],
                    answers: ["The architecture consists of the modules detected in the source code."],
                    insights: aggregatedSummaries ? "Project file structure successfully materialized." : "No project files detected or analyzed.",
                    fileObjects: fileObjects.map(f => ({ name: f.name, content: f.content })),
                    diagrams: { architecture: "graph TD\n  A[Incomplete Synthesis] --> B[Check Code Review Tab]" },
                    is_fallback: true
                }
            });
        }

        if (!response || (!response.summary && !response.is_fallback)) {
            throw new Error('AI returned an empty or invalid response.');
        }

        console.log('[ExplainForge] Storing AI results...');
        const { error: outError } = await supabase
            .from('explainforge_outputs')
            .insert({
                request_id: request.id,
                human_explanation: response.summary + "\n\n" + (response.humanExplanation || ""),
                interview_explanation: response.interviewExplanation,
                viva_explanation: response.insights || "N/A",
                report_content: { ...response.fullReport, flow: response.flowSteps },
                diagrams: response.diagrams,
                algorithms: (response.questions || []).map((q: string, i: number) => ({ name: q, explanation: response.answers?.[i] || "" })),
                questions: (response.questions || []).map((q: string, i: number) => ({ question: q, answer: response.answers?.[i] || "" }))
            });

        if (outError) {
            console.error('[ExplainForge] Output Storage error:', outError);
        }

        await logUsage(session.userId, 'explain_project');

        return NextResponse.json({
            success: true,
            data: {
                ...response,
                fileObjects: fileObjects.map(f => ({ name: f.name, content: f.content }))
            },
            requestId: request.id
        });
    } catch (error: unknown) {
        console.error('[ExplainForge API] Global Error:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to materialize the project logic.";
        return NextResponse.json({
            success: false,
            message: errorMessage,
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
            const { data, error } = await supabase
                .from('explainforge_requests')
                .select('*, explainforge_outputs(*), explainforge_files(*)')
                .eq('id', id)
                .eq('user_id', session.userId)
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        } else {
            const { data, error } = await supabase
                .from('explainforge_requests')
                .select('*, explainforge_outputs(id)')
                .eq('user_id', session.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ success: true, history: data });
        }
    } catch (error: unknown) {
        console.error('[ExplainForge GET] Error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch history" }, { status: 500 });
    }
}




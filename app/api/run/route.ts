import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, language } = body;

        if (!code || !language) {
            return NextResponse.json({ error: 'Code and Language are required' }, { status: 400 });
        }

        // JUDGE0_URL is usually http://34.170.78.245:2358
        // The user mentioned calling <VM_IP>:<PORT>/run
        const baseUrl = process.env.JUDGE0_URL || 'http://34.170.78.245:2358';
        const url = `${baseUrl}/run`;

        console.log('[RunnerProxy] Executing on VM:', url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s total timeout

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errExt = await response.text();
            console.error('[RunnerProxy] VM returned error:', errExt);
            return NextResponse.json({ error: `VM Error: ${response.statusText}`, detail: errExt }, { status: response.status });
        }

        const data = await response.json();
        console.log('[RunnerProxy] VM raw response:', data);

        // Normalize format for frontend
        const normalized = {
            stdout: data.stdout || data.output || '',
            stderr: data.stderr || data.error || data.compile_output || '',
            status: data.status?.description || 'Done',
            success: response.ok && !data.error && !data.stderr && (!data.status || data.status.id === 3),
            execution_time: data.time || data.duration || 0,
            // Requirement: Ensure response format: { output: "", error: "" }
            output: data.stdout || data.output || '',
            error: data.stderr || data.error || data.compile_output || ''
        };

        return NextResponse.json(normalized);
    } catch (err: unknown) {
        console.error('[RunnerProxy] Connection error:', err);
        
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ error: 'Connection to Judge Server timed out.' }, { status: 504 });
        }
        
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: 'Judge Server is offline or unreachable.', detail: message }, { status: 503 });
    }
}


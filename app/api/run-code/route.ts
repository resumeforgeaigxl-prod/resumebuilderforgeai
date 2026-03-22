import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { consumeCodeExecutionCredit, refundCodeExecutionCredit } from '@/lib/code-execution-credits';
import { createClient } from '@/lib/supabase/server';

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://34.170.78.245:2358';

const LANGUAGE_MAP: Record<string, number> = {
    'python': 71,
    'javascript': 63,
    'java': 62,
    'cpp': 54,
    'c': 50
};

export async function POST(req: Request) {
    // 1. Validate user session
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const { language, code, stdin, problemId } = await req.json();

    if (!language || !code) {
        return NextResponse.json({ error: 'Language and source code are required.' }, { status: 400 });
    }

    const languageId = LANGUAGE_MAP[language.toLowerCase()];
    if (!languageId) {
        return NextResponse.json({ error: 'Unsupported language.' }, { status: 400 });
    }

    // 2. Check and deduct credits BEFORE execution
    const creditResult = await consumeCodeExecutionCredit(session.userId);
    if (!creditResult.success) {
        return NextResponse.json({ error: creditResult.error }, { status: 429 });
    }

    try {
        const supabase = createClient();
        let testCases = [];

        // If it's a specific problem, fetch its test cases
        if (problemId) {
            const { data } = await supabase
                .from('coding_test_cases')
                .select('*')
                .eq('question_id', problemId)
                .order('order_index', { ascending: true });
            if (data && data.length > 0) {
                testCases = data;
            }
        }

        // If no test cases found, use the provided stdin (manual run)
        if (testCases.length === 0) {
            testCases = [{ input: stdin || "", expected_output: null, is_hidden: false }];
        }

        // 3. Execute all test cases (in parallel for performance)
        const runPromises = testCases.map(async (tc) => {
            const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin: tc.input || "",
                }),
            });

            if (!response.ok) throw new Error('Judge0 service error');
            const data = await response.json();

            const actualOutput = (data.stdout || '').trim();
            const expectedOutput = (tc.expected_output || '').trim();
            
            // Compare results if expected_output exists
            let passed = true;
            if (tc.expected_output !== null) {
                passed = actualOutput === expectedOutput;
            }

            return {
                input: tc.is_hidden ? '[Hidden]' : tc.input,
                expected: tc.is_hidden ? '[Hidden]' : tc.expected_output,
                actual: actualOutput,
                status: data.status?.description || 'Unknown',
                status_id: data.status?.id,
                time: data.time || 0,
                passed,
                stderr: data.stderr || data.compile_output || '',
            };
        });

        const results = await Promise.all(runPromises);

        // Aggregate overall result
        const anyFailed = results.some(r => !r.passed || r.status_id !== 3);
        
        return NextResponse.json({
            results,
            success: !anyFailed,
            summary: {
                total: results.length,
                passed: results.filter(r => r.passed && r.status_id === 3).length,
                failed: results.filter(r => !r.passed || r.status_id !== 3).length
            }
        });

    } catch (err) {
        console.error('[RunCode] Execution failed:', err);
        await refundCodeExecutionCredit(session.userId);
        return NextResponse.json({ 
            error: 'Execution failed. Try again.',
            safeMessage: 'Judge0 connection failed.' 
        }, { status: 500 });
    }
}

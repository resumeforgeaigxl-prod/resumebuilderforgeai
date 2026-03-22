export interface TestResult {
    input?: string;
    expected?: string | null;
    actual?: string;
    status: string;
    passed: boolean;
    time: number | string;
    stderr?: string;
}

export interface ExecutionSummary {
    total: number;
    passed: number;
    failed: number;
}

export interface ExecutionResult {
    results?: TestResult[];
    summary?: ExecutionSummary;
    stdout?: string;
    stderr?: string;
    error?: string;
    remaining?: number;
    status?: string;
    execution_time?: number;
    success?: boolean;
    safeMessage?: string;
    output?: string;
}

export async function retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
}

export function isValidLocation(location: unknown): boolean {
    if (!location) return true;
    
    let locationStr = '';
    if (typeof location === 'string') {
        locationStr = location;
    } else if (typeof location === 'object') {
        const obj = location as Record<string, unknown>;
        locationStr = String(obj.name || obj.display_name || obj.location || '');
    }

    if (!locationStr || locationStr.length < 2) return false;

    // Allow all locations except very obvious spam or empty strings
    // This ensures USA, Europe, and Global jobs are not filtered out
    return true;
}


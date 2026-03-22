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
    let locationStr = '';

    if (typeof location === 'string') {
        locationStr = location;
    } else if (location && typeof location === 'object') {
        const obj = location as Record<string, unknown>;
        locationStr = String(obj.name || obj.display_name || obj.location || '');
    } else {
        // If null/undefined, treat as potentially valid (defaulting to India in context)
        if (!location) return true;
        locationStr = String(location);
    }

    const lower = locationStr.toLowerCase();

    const validTerms = ['india', 'bangalore', 'hyderabad', 'pune', 'chennai', 'remote', 'bengaluru', 'gurgaon', 'noida', 'mumbai'];
    return validTerms.some(term => lower.includes(term));
}


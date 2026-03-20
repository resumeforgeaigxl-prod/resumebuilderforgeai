export const AI_MESSAGES = {
    BUSY: "AI is busy, showing partial result",
    ERROR: "Something went wrong. Please try again later.",
    QUOTA: "Rate limit exceeded. Switching providers...",
    FALLBACK: "Generated using fallback model."
};

/**
 * Returns a safe fallback response if AI fails completely.
 */
export function getFallbackResponse(task: string) {
    return {
        text: JSON.stringify({
            error: AI_MESSAGES.BUSY,
            is_fallback: true,
            task
        }),
        is_error: true
    };
}

import { createClient } from '@/lib/supabase/server';

/**
 * Basic retriever for RAG.
 * In a production environment, this would use vector-based search (pgvector).
 */
export async function retrieveRelevantDocs(query: string, limit: number = 3): Promise<string[]> {
    const supabase = createClient();
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) return [];

    try {
        // Mocking retrieval from a potential 'knowledge_base' or 'docs' table
        // For now, we search similar past successful explanations or roadmap items
        const { data, error } = await supabase
            .from('mentor_chats')
            .select('content')
            .eq('role', 'assistant')
            .ilike('content', `%${keywords[0]}%`)
            .limit(limit);

        if (error || !data) return [];
        return data.map(d => d.content.substring(0, 500));
    } catch (err) {
        console.error('[Retriever] Error:', err);
        return [];
    }
}

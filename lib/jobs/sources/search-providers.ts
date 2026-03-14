export interface SearchResult {
    title: string;
    description: string;
    url: string;
}

interface SerperOrganicResult {
    title?: string;
    snippet?: string;
    link?: string;
}

interface SerperResponse {
    organic?: SerperOrganicResult[];
}

interface DuckDuckGoTopic {
    Text?: string;
    FirstURL?: string;
    Topics?: DuckDuckGoTopic[];
}

interface DuckDuckGoResponse {
    RelatedTopics?: DuckDuckGoTopic[];
}

interface TavilyResult {
    title?: string;
    content?: string;
    url?: string;
}

interface TavilyResponse {
    results?: TavilyResult[];
}

function flattenDuckDuckGoTopics(topics: DuckDuckGoTopic[]): DuckDuckGoTopic[] {
    return topics.flatMap((topic) => topic.Topics ? flattenDuckDuckGoTopics(topic.Topics) : [topic]);
}

/**
 * Serper.dev Google Search API
 */
export async function searchSerper(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.warn('[SearchProvider] Serper API key missing.');
        return [];
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 10 })
        });

        const data = await response.json() as SerperResponse;
        return (data.organic || []).map((item) => ({
            title: item.title || '',
            description: item.snippet || '',
            url: item.link || ''
        }));
    } catch (error) {
        console.error('[SearchProvider] Serper Error:', error);
        return [];
    }
}

/**
 * DuckDuckGo Search API (Instant Answer API)
 */
export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        const data = await response.json() as DuckDuckGoResponse;
        const topics = flattenDuckDuckGoTopics(data.RelatedTopics || []);
        
        // DuckDuckGo Instant Answer API returns 'RelatedTopics' as potential search results
        const results: SearchResult[] = topics.map((item) => ({
            title: item.Text || '',
            description: item.Text || '',
            url: item.FirstURL || ''
        })).filter((item) => Boolean(item.url));

        return results;
    } catch (error) {
        console.error('[SearchProvider] DuckDuckGo Error:', error);
        return [];
    }
}

/**
 * Tavily AI Search API
 */
export async function searchTavily(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        console.warn('[SearchProvider] Tavily API key missing.');
        return [];
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                max_results: 10
            })
        });

        const data = await response.json() as TavilyResponse;
        return (data.results || []).map((item) => ({
            title: item.title || '',
            description: item.content || '',
            url: item.url || ''
        }));
    } catch (error) {
        console.error('[SearchProvider] Tavily Error:', error);
        return [];
    }
}

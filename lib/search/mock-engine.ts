/**
 * Enterprise Search Abstraction (Typesense/Algolia Mock)
 * Provides ultra-low latency search simulation for job discovery.
 */
export const searchEngine = {
    async searchJobs(query: string) {
        // Simulate Typesense network latency (15-30ms)
        await new Promise(resolve => setTimeout(resolve, 25));

        const allJobs = [
            { id: '1', title: 'Senior React Developer', company: 'Google', location: 'Remote', salary: '$180k - $240k', tags: ['React', 'Next.js'] },
            { id: '2', title: 'Staff Engineer', company: 'Netflix', location: 'Los Gatos, CA', salary: '$450k', tags: ['Java', 'Distributed Systems'] },
            { id: '3', title: 'Frontend Architect', company: 'Stripe', location: 'San Francisco, CA', salary: '$220k - $300k', tags: ['TypeScript', 'Design Systems'] },
            { id: '4', title: 'AI Solutions Engineer', company: 'OpenAI', location: 'Remote', salary: '$300k+', tags: ['Python', 'LLMs'] },
            { id: '5', title: 'Product Designer', company: 'Airbnb', location: 'Remote', salary: '$160k - $210k', tags: ['Figma', 'UI/UX'] },
        ];

        if (!query) return allJobs;

        return allJobs.filter(job => 
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
        );
    }
};

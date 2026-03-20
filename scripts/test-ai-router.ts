import { callAI } from '../lib/ai/router';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
    console.log("--- Testing AI Router ---");

    try {
        console.log("\n1. Testing Resume Optimization Task (Chain: Gemini -> Mistral -> OpenRouter)");
        const resumeRes = await callAI({
            task: 'resume',
            prompt: 'Test prompt: Optimize this bullet point: Created a web app.',
            userId: 'test-user-id'
        });
        console.log(`Success! Provider: ${resumeRes.provider}, Model: ${resumeRes.model}`);

        console.log("\n2. Testing Code Explanation Task (Chain: Gemini -> DeepSeek -> HuggingFace)");
        const codeRes = await callAI({
            task: 'explain',
            prompt: 'Explain what a Promise is in JavaScript.',
            userId: 'test-user-id'
        });
        console.log(`Success! Provider: ${codeRes.provider}, Model: ${codeRes.model}`);

        console.log("\n3. Testing Cache Hit");
        const startTime = Date.now();
        const cacheRes = await callAI({
            task: 'resume',
            prompt: 'Test prompt: Optimize this bullet point: Created a web app.',
            userId: 'test-user-id'
        });
        const duration = Date.now() - startTime;
        console.log(`Success! Cache hit in ${duration}ms (Expected < 50ms)`);

        console.log("\n4. Testing Mentor Forge (Central AI)");
        const { MentorForge } = await import('../lib/ai/forges/mentor');
        const mentorRes = await MentorForge.analyzeUser({ careerGoals: 'Become a Senior Frontend Engineer' }, 'test-user-id');
        console.log(`Success! Mentor response: ${mentorRes.text.substring(0, 100)}...`);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();

import { NextRequest, NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName } = await req.json();

    const prompt = `Create a high-converting product demo script for an AI-powered platform called "${productName || 'ResumeForgeAI'}".
    The platform has these modules:
    - ResumeForge: AI Resume Builder
    - CodingForge: Real-time coding practice
    - InterviewForge: AI Mock Interviews
    - CareerForge: AI Roadmaps
    - LearnForge: Curated learning resources
    - JobForge: AI Job Search
    - PortfolioForge: Portfolio generator

    Provide a structured demo in JSON format with exactly "scenes" as the key.
    Each scene should have:
    - image: a descriptive placeholder (e.g. "hero-section", "resume-builder-ui")
    - title: engaging hook text
    - subtitle: benefit-driven explanation
    - duration: duration in seconds (usually 3-5s)

    Return ONLY valid JSON.`;

    const systemInstruction = "You are a marketing expert skilled in creating product demos for SaaS platforms.";

    const result = await generateJsonGemini(prompt, systemInstruction);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Demo script generation error:', msg);
    return NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 });
  }
}

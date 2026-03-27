import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateProject } from '@/lib/projectforge-ai';
import { getUserCredits, consumeCredit } from '@/lib/projectforge-credits';
import { getSession } from '@/lib/auth/jwt';
import { checkForgeAccess, incrementForgeUsage } from '@/lib/auth/usage';

export async function POST(req: Request) {
    const supabase = createClient();
    const session = await getSession();
    const user = session;

    if (!user || !user.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea } = await req.json();

    if (!idea || typeof idea !== 'string') {
        return NextResponse.json({ error: 'Project idea is required' }, { status: 400 });
    }

    // New Forge Ecosystem Access Check
    const access = await checkForgeAccess('projectforge');
    if (!access.hasAccess && access.reason === 'limit_reached') {
        return NextResponse.json({ 
            error: 'You’ve reached your free project creation limit. Unlock full access to continue building.',
            limitReached: true 
        }, { status: 403 });
    }

    // Step 0: Check legacy daily credits (optional, but keeping for double safety)
    const { credits } = await getUserCredits(user.userId);
    if (credits <= 0 && !access.isAdmin) {
        return NextResponse.json({ error: 'System daily limit reached. Try again in 24h.' }, { status: 429 });
    }


    try {
        // Step 1: Save request
        const { data: request, error: requestError } = await supabase
            .from('project_requests')
            .insert({
                user_id: user.userId,
                idea: idea,
            })
            .select()
            .single();

        if (requestError) throw requestError;

        // Step 2: Generate project via AI
        const projectData = await generateProject(idea);

        // Step 3: Save output
        const { data: output, error: outputError } = await supabase
            .from('project_outputs')
            .insert({
                request_id: request.id,
                user_id: user.userId,
                project_name: projectData.project_name,
                tech_stack: projectData.tech_stack,
                folder_structure: projectData.folder_structure,
                files: projectData.files,
                preview_html: projectData.preview_html,
                explanation: projectData.explanation,
            })
            .select()
            .single();

        if (outputError) throw outputError;

        // Step 4: Consume credit
        await consumeCredit(user.userId);

        // Step 5: Forge Ecosystem Usage Track
        await incrementForgeUsage('projectforge');

        // Step 6: Record Activity for Streak
        const { recordUserActivity } = await import('@/lib/streak-service');
        await recordUserActivity(user.userId);

        return NextResponse.json({
            success: true,
            projectId: output.id,
            remainingCredits: credits - 1
        });
    } catch (error) {
        console.error('ProjectForge API Error:', error);
        return NextResponse.json({ error: 'Failed to generate project. Please try again.' }, { status: 500 });
    }
}

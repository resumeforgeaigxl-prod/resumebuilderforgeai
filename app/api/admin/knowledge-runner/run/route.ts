import { NextRequest, NextResponse } from 'next/server';
import { generateLearningArticle } from '@/lib/gemini-service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { topicId } = await req.json();

    const { data: topic } = await supabase
      .from('knowledge_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

    let article;
    try {
      let aiResponse = await generateLearningArticle(topic.name);
      
      // Step 2: Handle accidental JSON responses
      if (typeof aiResponse === "string") {
        try {
          // If it starts with JSON indicators, try to parse it
          if (aiResponse.trim().startsWith('{') || aiResponse.trim().startsWith('[')) {
            const parsed = JSON.parse(aiResponse);
            aiResponse = parsed.content || parsed.lesson?.content || aiResponse;
          }
        } catch {
          // Keep as raw text if parsing fails
        }
      }

      // Step 3: Normalize spacing, handle literal \n and trim
      article = aiResponse
        .replace(/\\n/g, "\n")       // Fix literal \n strings
        .replace(/\n{3,}/g, "\n\n") // normalize excessive spacing
        .replace(/```json/g, "")    // Remove accidental fences
        .replace(/```/g, "")
        .trim();
        
    } catch (aiErr) {
      console.error("AI Generation failed, using raw fallback:", aiErr);
      article = "# " + topic.name + "\n\nContent temporarily unavailable due to AI error. Please try again.";
    }

    // Prepare result object for DB logic
    const finalResult = {
      lesson: {
        title: topic.name,
        content: article,
        order_index: 0
      },
      meta: { 
        title: `${topic.name} Guide | ResumeForgeAI`, 
        description: `Comprehensive guide about ${topic.name}` 
      },
      related_topics: [],
      examples: [],
      questions: []
    };

    // Update topic with metadata and related topics
    await supabase
      .from('knowledge_topics')
      .update({
        meta_title: finalResult.meta.title,
        meta_description: finalResult.meta.description,
        related_topics: finalResult.related_topics
      })
      .eq('id', topicId);

    // Save to database
    const { data: lesson, error: lError } = await supabase
      .from('knowledge_lessons')
      .insert({
        topic_id: topicId,
        title: finalResult.lesson.title,
        content: finalResult.lesson.content,
        order_index: finalResult.lesson.order_index
      })
      .select()
      .single();

    if (lError) throw lError;

    if (finalResult.examples?.length > 0) {
      await supabase.from('knowledge_examples').insert(
        finalResult.examples.map((ex: any) => ({ ...ex, lesson_id: lesson.id }))
      );
    }

    if (finalResult.questions?.length > 0) {
      await supabase.from('knowledge_questions').insert(
        finalResult.questions.map((q: any) => ({ ...q, lesson_id: lesson.id }))
      );
    }

    return NextResponse.json({ success: true, lessonId: lesson.id });
  } catch (error: any) {
    console.error('Knowledge Runner Fatal Error:', error);
    // Even on fatal errors, return a 200 with error info to avoid 500 crashes in UI
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 200 });
  }
}

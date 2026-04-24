export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jsPDF } from 'jspdf';
import { getSession } from '@/lib/auth/jwt';

interface TopicInfo {
  name: string;
}

interface LessonData {
  title: string;
  content: string;
  knowledge_topics: TopicInfo | null;
}

// Since jspdf/react-pdf is complex for direct server-side generation without specific local setup,
// we'll implement a stub that demonstrates the watermark logic.
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');
    
    // Auth Check
    const session = await getSession();
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', session.userId)
      .single();
      
    const userName = profile?.full_name || 'User';

    // 1. Fetch latest lesson content
    const { data } = await supabase
      .from('knowledge_lessons')
      .select('*, knowledge_topics(name)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lesson = data as unknown as LessonData | null;

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson content not found' }, { status: 404 });
    }

    // 2. Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Set Title
    doc.setFontSize(22);
    doc.setTextColor(63, 81, 181); // Indigo color
    doc.text(lesson.knowledge_topics?.name || lesson.title, 20, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(lesson.title, 20, 40);

    // Border line
    doc.setDrawColor(200);
    doc.line(20, 45, pageWidth - 20, 45);

    // 3. Add content with JSON protection
    doc.setFontSize(11);
    doc.setTextColor(50);
    
    let rawContent = lesson.content;
    // Check for JSON and try to extract content
    if (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(rawContent);
        rawContent = parsed.content || parsed.lesson?.content || "Content parsing error. Please view on web.";
      } catch {
        rawContent = "Restructuring content for PDF. Please refresh the topic and try again.";
      }
    }

    // Clean markdown bolding/italics for plain PDF text (simple version)
    const cleanText = rawContent
      .replace(/#/g, '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\\n/g, '\n');

    const splitContent = doc.splitTextToSize(cleanText, pageWidth - 40);
    
    let y = 60;
    
    // Header on first page
    addBrandingHeader(doc, pageWidth);

    splitContent.forEach((line: string) => {
      if (y > pageHeight - 35) {
        addWatermark(doc, userName, pageWidth, pageHeight);
        addBrandingFooter(doc, pageWidth, pageHeight);
        doc.addPage();
        addBrandingHeader(doc, pageWidth);
        y = 35;
      }
      doc.text(line, 20, y);
      y += 6.5;
    });

    // Add watermark and footer to the last page
    addWatermark(doc, userName, pageWidth, pageHeight);
    addBrandingFooter(doc, pageWidth, pageHeight);

    // 4. Return as PDF
    const pdfOutput = doc.output('arraybuffer');
    
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(lesson.knowledge_topics?.name || 'knowledge').replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('PDF Generation Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function addWatermark(doc: jsPDF, userName: string, pageWidth: number, pageHeight: number) {
  // Use any for plugin-based methods to satisfy compiler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = doc as any;
  if (d.saveGraphicsState) d.saveGraphicsState();
  if (d.GState) {
    d.setGState(new d.GState({ opacity: 0.1 }));
  }
  doc.setFontSize(40);
  doc.setTextColor(150);
  doc.text(`${userName} • ResumeForgeAI`, pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: 'center'
  });
  if (d.restoreGraphicsState) d.restoreGraphicsState();
}

function addBrandingHeader(doc: jsPDF, pageWidth: number) {
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("KNOWLEDGEFORGE • OFFICIAL LEARNING RESOURCE", 20, 15);
  doc.text("RESUMEFORGEAI", pageWidth - 20, 15, { align: 'right' });
  doc.setDrawColor(230);
  doc.line(20, 18, pageWidth - 20, 18);
}

function addBrandingFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text("Generated by ResumeForgeAI Central Intelligence", pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
}


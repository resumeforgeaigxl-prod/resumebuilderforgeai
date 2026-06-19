'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Mic, CheckCircle, ArrowRight, RotateCcw, FileText, Target, Calendar, BarChart, TrendingUp, X, Award, Lightbulb, Clock, Layers, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureGate } from '@/components/pricing/FeatureGate';
import Link from 'next/link';

interface IntelligenceReport {
  company: string;
  role: string;
  difficulty_level: string;
  hiring_process: Array<{
    round_name: string;
    details: string;
    expected_difficulty: string;
  }>;
  top_questions: Array<{
    question: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    frequency: 'High' | 'Medium' | 'Low';
    answer_coach: {
      ideal_structure: string[];
      example_answer: string;
      common_mistakes: string[];
    }
  }>;
  topic_heatmap: Array<{ topic: string, percentage: number }>;
  prep_roadmap: Array<{ day: number, topics: string[], tasks: string[] }>;
}

interface InterviewSetup {
  role: string;
  jobDescription: string;
  experienceLevel: string;
  interviewType: string;
  numQuestions: number;
  interviewMode: 'chat' | 'voice';
}

interface QuestionEvaluation {
  score: number;
  feedback: string;
  tips: string;
}

interface InterviewSession {
  id: string;
  questions: string[];
  answers: string[];
  evaluations: QuestionEvaluation[];
  currentQuestionIndex: number;
  isComplete: boolean;
  interviewMode: 'chat' | 'voice';
}

interface User {
  id: string;
  plan_type?: string;
  daily_mock_limit?: number;
  plan_end?: string;
  interviewsUsed: number;
  interviewLimit: number;
}

export default function CompanyPrepInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#171717]" />
      </div>
    }>
      <FeatureGate task="company-prep">
        <CompanyPrepInterviewContent />
      </FeatureGate>
    </Suspense>
  );
}

function CompanyPrepInterviewContent() {
  const params = useParams() as { locale: string };
  const { locale } = params;
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') || '';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [calendar, setCalendar] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [setup, setSetup] = useState<InterviewSetup>({
    role: initialRole,
    jobDescription: '',
    experienceLevel: 'junior',
    interviewType: 'technical',
    numQuestions: 10,
    interviewMode: 'chat'
  });
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [intelligenceReport, setIntelligenceReport] = useState<IntelligenceReport | null>(null);
  const [showCoachFor, setShowCoachFor] = useState<number | null>(null);
  const [finalReport, setFinalReport] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarForm, setCalendarForm] = useState({ company: '', role: '', date: '', notes: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accessRes, historyRes] = await Promise.all([
          fetch('/api/mock-interview'),
          fetch('/api/interview-prep/history')
        ]);

        const accessData = await accessRes.json();
        const historyData = await historyRes.json();

        if (accessRes.status === 401) {
          window.location.href = `/${locale}/login`;
          return;
        }

        if (accessData.user) {
          setUser(accessData.user);
          if (accessData.user.interviewsUsed >= accessData.user.interviewLimit) {
            setError(`You've reached your daily limit of ${accessData.user.interviewLimit} interviews.`);
          }
        }

        if (historyData.success) {
          setHistory(historyData.history);
          setCalendar(historyData.calendar);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  const startInterview = async () => {
    if (!setup.role.trim()) {
      setError('Please enter a target job role');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const parts = setup.role.split(' - ');
      const comp = parts[0]?.trim() || setup.role;
      const jobRole = parts[1]?.trim() || setup.role;

      // PostHog Tracking
      try {
        const posthog = (await import('@/lib/posthog')).default;
        posthog.capture('interview_intelligence_request', {
          user_id: user.id,
          company_name: comp,
          job_role: jobRole
        });
      } catch (e) { console.error('[PostHog] Event error:', e); }

      const genRes = await fetch('/api/interview-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: comp, role: jobRole })
      });

      const genData = await genRes.json();
      console.log('[Interview Prep] Response Data:', genData);
      if (!genData.success || !genData.data) throw new Error(genData.error || 'Failed to generate intelligence report');

      setIntelligenceReport(genData.data);
    } catch (err) {
      console.error('Failed to generate intelligence:', err);
      setError('Failed to generate interview intelligence. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const launchMockSession = async () => {
    if (!intelligenceReport) return;
    setIsGenerating(true);

    try {
      const questions = intelligenceReport.top_questions.map(q => q.question);
      const res = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          role: `${intelligenceReport.company} - ${intelligenceReport.role}`,
          jobDescription: 'Interview Prep Simulation',
          experienceLevel: setup.experienceLevel,
          interviewType: setup.interviewType,
          numQuestions: questions.length,
          questions: questions,
          interviewMode: setup.interviewMode
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSession({
        id: data.interview.id,
        questions,
        answers: [],
        evaluations: [],
        currentQuestionIndex: 0,
        isComplete: false,
        interviewMode: setup.interviewMode
      });

      if (setup.interviewMode === 'voice') {
        speak(`Welcome to your ${intelligenceReport.company} interview. Question 1: ${questions[0]}`);
      }
    } catch {
      setError('Failed to launch interview session.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addToCalendar = async () => {
    if (!calendarForm.company || !calendarForm.role || !calendarForm.date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/interview-prep/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendarForm)
      });
      const data = await res.json();
      if (data.success) {
        setCalendar([...calendar, data.event]);
        setShowCalendarModal(false);
        setCalendarForm({ company: '', role: '', date: '', notes: '' });
      }
    } catch {
      setError('Failed to save to calendar');
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      const question = session.questions[session.currentQuestionIndex];
      const evalRes = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate-answer',
          question,
          answer: currentAnswer
        })
      });

      const evalData = await evalRes.json();
      if (evalData.error) throw new Error(evalData.error);

      const evaluation: QuestionEvaluation = evalData.evaluation;
      const newAnswers = [...session.answers, currentAnswer];
      const newEvaluations = [...session.evaluations, evaluation];

      const nextIndex = session.currentQuestionIndex + 1;
      const isComplete = nextIndex >= session.questions.length;

      let finalPercentage: number | undefined;
      let finalReportData = null;

      if (isComplete) {
        // Generate High-Fidelity Intelligence Report
        const reportRes = await fetch('/api/mock-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-final-report',
            questions: session.questions,
            answers: newAnswers,
            scores: newEvaluations
          })
        });
        const reportJson = await reportRes.json();
        if (reportJson.success) {
          finalReportData = reportJson.report;
          finalPercentage = reportJson.report.overall_readiness;
          setFinalReport(finalReportData);
        }
      }

      await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: session.id,
          answers: newAnswers,
          scores: newEvaluations,
          finalScore: finalPercentage,
          detailedScores: finalReportData
        })
      });

      setSession({
        ...session,
        answers: newAnswers,
        evaluations: newEvaluations,
        currentQuestionIndex: nextIndex,
        isComplete
      });

      setCurrentAnswer('');

      if (session.interviewMode === 'voice' && !isComplete) {
        const feedbackPrefix = evaluation.score >= 7 ? "Good answer. " : "I see. ";
        speak(`${feedbackPrefix} Let's move to the next question. Question ${nextIndex + 1}: ${session.questions[nextIndex]}`);
      }
    } catch (_err) {
      console.error('Failed to evaluate answer:', _err);
      setError('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentAnswer('');
    setError('');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(transcript);
      };

      recog.onerror = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Switching to Chat mode.');
          if (session) {
            setSession({ ...session, interviewMode: 'chat' });
          } else {
            setSetup({ ...setup, interviewMode: 'chat' });
          }
        }
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recog);
    }
  }, [session, setup]);

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      setError('');
      try {
        recognition?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
          (v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira') || v.name.includes('Victoria')) && v.lang.startsWith('en')
        );

        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
      } else {
        setVoiceAndSpeak();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#171717]" />
      </div>
    );
  }

  if (error && !session && error.includes('limit')) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-600 font-bold text-lg mb-2">Access Limited</h2>
          <p className="text-[#4D4D4D] mb-4">{error}</p>
          <Link
            href={`/${locale}/billing`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#333333] text-white rounded-md font-bold transition-all text-sm"
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (intelligenceReport && !session) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-premium-in pb-20 text-[#171717]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/5 border border-[#0070F3]/10 text-[#0070F3] text-[10px] font-bold uppercase tracking-wider mb-3">
              <Award className="w-3 h-3" /> Interview Intelligence Report
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">{intelligenceReport.company}</h1>
            <p className="text-lg text-[#4D4D4D] mt-1">{intelligenceReport.role}</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-[#8F8F8F] uppercase font-bold tracking-widest leading-tight">Difficulty</p>
                <p className="text-[#171717] font-semibold text-sm leading-tight mt-0.5">{intelligenceReport.difficulty_level}</p>
              </div>
            </div>
            <button
              onClick={launchMockSession}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#171717] hover:bg-[#333333] text-white font-semibold rounded-md transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isGenerating ? 'Initializing...' : <>Start Mock Interview <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Process & Roadmap */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hiring Process Section */}
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm relative overflow-hidden">
              <h2 className="text-lg font-semibold text-[#171717] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0070F3]/5 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#0070F3]" />
                </div>
                Process Breakdown
              </h2>
              <div className="space-y-6 relative">
                {intelligenceReport.hiring_process.map((round, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] flex items-center justify-center text-sm font-semibold text-[#4D4D4D] group-hover:border-[#171717] group-hover:text-[#171717] transition-colors shadow-sm">
                        {idx + 1}
                      </div>
                      {idx !== intelligenceReport.hiring_process.length - 1 && (
                        <div className="w-px h-full bg-[#EBEBEB] mt-2"></div>
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <h3 className="text-[#171717] font-semibold text-base mb-1 group-hover:text-[#0070F3] transition-colors">{round.round_name}</h3>
                      <p className="text-[#4D4D4D] text-sm leading-relaxed mb-2">{round.details}</p>
                      <span className="text-[10px] bg-[#FAFAFA] border border-[#EBEBEB] px-2 py-0.5 rounded text-[#8F8F8F] font-bold uppercase tracking-tight italic">Difficulty: {round.expected_difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prep Roadmap Section */}
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-[#171717] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                4-Day Prep Roadmap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligenceReport.prep_roadmap.map((day, idx) => (
                  <div key={idx} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5 hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Day {day.day}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {day.topics.map((t, i) => (
                        <span key={i} className="text-[10px] bg-[#FFFFFF] border border-[#EBEBEB] px-2 py-0.5 rounded text-[#4D4D4D] font-medium">{t}</span>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {day.tasks.map((task, i) => (
                        <li key={i} className="text-xs text-[#4D4D4D] flex items-start gap-2 italic">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Heatmap & FAQ Access */}
          <div className="space-y-8">
            {/* Topic Heatmap */}
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
              <h2 className="text-base font-semibold text-[#171717] mb-6 flex items-center gap-3">
                <BarChart className="w-4 h-4 text-purple-600" /> Topic Focus
              </h2>
              <div className="space-y-5">
                {intelligenceReport.topic_heatmap.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[#4D4D4D] font-medium">{item.topic}</span>
                      <span className="text-[#171717] font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#FAFAFA] border border-[#EBEBEB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#171717] rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#EBEBEB]">
                <p className="text-xs text-[#8F8F8F] italic leading-relaxed text-center font-medium">
                  AI has analyzed 500+ interview experiences to generate this distribution.
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#FFEFCF]/30 border border-[#FFE0B2] rounded-xl p-6">
              <h3 className="text-[#AB570A] font-semibold flex items-center gap-2 mb-3 text-sm">
                <Lightbulb className="w-4 h-4 text-[#AB570A]" /> Pro Tip
              </h3>
              <p className="text-[#AB570A] text-xs leading-relaxed mb-4 font-medium italic">
                {intelligenceReport.company} interviews often focus heavily on <strong>{intelligenceReport.topic_heatmap[0]?.topic}</strong>. Ensure you can explain your previous projects using the STAR method.
              </p>
              <button
                onClick={launchMockSession}
                className="w-full py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-medium text-xs uppercase tracking-wider rounded-md transition-all active:scale-[0.98]"
              >
                Test My Readiness
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Questions Database */}
        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-[#171717]">Top Questions Database</h2>
            <span className="text-xs text-[#8F8F8F] uppercase tracking-wider font-bold">{intelligenceReport.top_questions.length} Aggregated Questions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intelligenceReport.top_questions.map((q, idx) => (
              <div key={idx} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6 hover:border-[#171717]/30 transition-all cursor-pointer group flex flex-col justify-between" onClick={() => setShowCoachFor(idx)}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {q.difficulty}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200`}>
                      {q.frequency} Frequency
                    </span>
                  </div>
                  <p className="text-[#171717] font-semibold text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-[#0070F3] transition-colors italic">&quot;{q.question}&quot;</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#EBEBEB] mt-4">
                  <span className="text-[10px] text-[#8F8F8F] font-bold uppercase">{q.topic}</span>
                  <span className="text-[10px] text-[#0070F3] font-bold uppercase flex items-center gap-1">Coach <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Coach Modal */}
        {showCoachFor !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl relative text-[#171717]">
              <button
                onClick={() => setShowCoachFor(null)}
                className="absolute top-6 right-6 p-2 hover:bg-[#FAFAFA] rounded-full text-[#8F8F8F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mb-8">
                <h1 className="text-lg font-semibold text-[#171717] mb-3 leading-relaxed">Question</h1>
                <div className="p-4 bg-[#FAFAFA] border-l-4 border-[#171717] rounded-r-lg">
                  <p className="text-base text-[#4D4D4D] font-medium italic">&quot;{intelligenceReport.top_questions[showCoachFor].question}&quot;</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-[#0070F3] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                    <TrendingUp className="w-4 h-4" /> Ideal Structure
                  </h3>
                  <div className="space-y-3">
                    {intelligenceReport.top_questions[showCoachFor].answer_coach.ideal_structure.map((step, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-6 h-6 rounded-md bg-[#0070F3]/10 flex items-center justify-center text-[10px] font-bold text-[#0070F3] shrink-0">{i + 1}</div>
                        <p className="text-[#4D4D4D] text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 font-mono">Example Master Answer</h3>
                  <div className="bg-[#FAFAFA] border border-emerald-200 p-5 rounded-lg">
                    <p className="text-sm text-[#4D4D4D] leading-relaxed font-medium italic">&quot;{intelligenceReport.top_questions[showCoachFor].answer_coach.example_answer}&quot;</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 font-mono">Common Pitfalls</h3>
                  <ul className="space-y-2">
                    {intelligenceReport.top_questions[showCoachFor].answer_coach.common_mistakes.map((mistake, i) => (
                      <li key={i} className="text-xs text-[#8F8F8F] flex items-start gap-2">
                        <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EBEBEB] flex gap-4">
                <button
                  onClick={() => setShowCoachFor(null)}
                  className="flex-1 py-3 bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#EBEBEB] text-[#171717] font-semibold rounded-md transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (session?.isComplete) {
    const report = finalReport;

    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-premium-in pb-20 text-[#171717]">
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-semibold text-[#171717] mb-3 tracking-tight uppercase italic">Mission Complete</h1>
          <p className="text-[#4D4D4D] text-lg max-w-2xl mx-auto">Neural evaluation finished. Detailed performance matrix generated for your {intelligenceReport?.company} application.</p>
        </div>

        {report ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Scorecard */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-10 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: -90, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative shrink-0"
                  >
                    <svg className="w-40 h-40 transform">
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#FAFAFA]" />
                      <motion.circle
                        cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={2 * Math.PI * 72}
                        initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - report.overall_readiness / 100) }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                        className="text-[#171717] transition-all"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-90">
                      <span className="text-4xl font-bold text-[#171717]">{report.overall_readiness}%</span>
                      <span className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-widest mt-1">Ready</span>
                    </div>
                  </motion.div>
                  <div className="flex-1 space-y-6 w-full">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Technical', val: report.technical, color: 'bg-blue-600' },
                        { label: 'Communication', val: report.communication, color: 'bg-purple-600' },
                        { label: 'Problem Solving', val: report.problem_solving, color: 'bg-emerald-600' },
                        { label: 'Confidence', val: report.confidence, color: 'bg-amber-600' }
                      ].map((item, i) => (
                        <div key={i} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-[#8F8F8F] uppercase font-black">{item.label}</span>
                            <span className="text-[#171717] font-bold text-xs">{item.val}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-full">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-10 shadow-sm">
                <h2 className="text-lg font-semibold text-[#171717] mb-6 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#0070F3]" /> Improvement Roadmap
                </h2>
                <div className="space-y-4">
                  {report.improvement_suggestions.map((suggestion: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-[#0070F3]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#0070F3]"></div>
                      </div>
                      <p className="text-sm text-[#4D4D4D] leading-relaxed italic">&quot;{suggestion}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#171717] rounded-xl p-8 text-white shadow-md">
                <Award className="w-8 h-8 mb-6 opacity-80" />
                <h3 className="text-xl font-bold leading-tight mb-2">Candidate Comparison</h3>
                <p className="text-white/70 text-xs mb-8 leading-relaxed">Based on current market data for {intelligenceReport?.role} roles.</p>
                <div className="text-4xl font-black mb-2">{report.readiness_comparison_percentile}%</div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Better than other applicants</p>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">Insight</p>
                  <p className="text-xs mt-1 italic">&quot;You are in the top tier for problem solving. Focus on communication to lock the offer.&quot;</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
                <h3 className="text-base font-semibold text-[#171717] mb-6">Action Items</h3>
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/resumes`}
                    className="w-full py-3 bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] rounded-md flex items-center justify-center gap-2 font-medium transition-all text-xs"
                  >
                    Optimize Resume <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={resetInterview}
                    className="w-full py-3 bg-[#171717] hover:bg-[#333333] text-white rounded-md flex items-center justify-center gap-2 font-medium transition-all text-xs"
                  >
                    Try Another Mode <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 text-[#171717] animate-spin mb-4" />
            <p className="text-[#8F8F8F] font-semibold text-sm">Synthesizing Final Report...</p>
          </div>
        )}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-premium-in pb-20 text-[#171717]">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
            <div>
                <div className="flex items-center gap-2 text-[#8F8F8F] font-bold tracking-wider text-[10px] uppercase mb-3 font-mono">
                    <Mic className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">CompanyPrep</h1>
                <p className="text-[#4D4D4D] mt-2 text-sm md:text-base max-w-2xl">Generate company-specific intelligence reports and simulate high-stakes neural interviews.</p>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-normal">Signal Override</div>
                <span className="border border-[#EBEBEB] bg-[#FAFAFA] text-emerald-600 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Active</span>
            </div>
        </header>

        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 sm:p-10 shadow-sm relative overflow-hidden group">
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">
                Company & Target Role
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={setup.role}
                  onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                  placeholder="e.g. Google - Product Manager"
                  className="w-full px-5 py-4 bg-[#FFFFFF] border border-[#EBEBEB] rounded-lg text-sm text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] focus:ring-0 transition-all outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F8F8F] group-focus-within:text-[#171717] transition-colors">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-3 text-xs text-[#8F8F8F] italic font-medium">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Input format: Corporate Name - Vertical (e.g. Netflix - Backend)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">
                  Engagement Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSetup({ ...setup, interviewMode: 'chat' })}
                    className={`flex-1 relative flex items-center gap-4 p-4 rounded-lg border transition-all ${setup.interviewMode === 'chat'
                      ? 'bg-[#171717]/5 border-[#171717] text-[#171717] font-semibold'
                      : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                      }`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0 text-[#171717]" />
                    <div className="text-left">
                      <div className="text-xs uppercase font-bold tracking-tight">Chat</div>
                      <div className="text-[10px] opacity-60 mt-0.5">Text-based</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSetup({ ...setup, interviewMode: 'voice' })}
                    className={`flex-1 relative flex items-center gap-4 p-4 rounded-lg border transition-all ${setup.interviewMode === 'voice'
                      ? 'bg-[#171717]/5 border-[#171717] text-[#171717] font-semibold'
                      : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                      }`}
                  >
                    <Mic className="w-4 h-4 flex-shrink-0 text-[#171717]" />
                    <div className="text-left">
                      <div className="text-xs uppercase font-bold tracking-tight">Voice</div>
                      <div className="text-[10px] opacity-60 mt-0.5">Speech-to-Text</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">
                  Experience Context
                </label>
                <div className="relative">
                  <select
                    value={setup.experienceLevel}
                    onChange={(e) => setSetup({ ...setup, experienceLevel: e.target.value })}
                    className="w-full px-5 py-4 bg-[#FFFFFF] border border-[#EBEBEB] rounded-lg text-[#171717] text-sm outline-none focus:border-[#171717] appearance-none cursor-pointer font-medium"
                  >
                    <option value="intern">Intern / New Grad</option>
                    <option value="junior">Junior (1-3 Years)</option>
                    <option value="mid">Mid (3-5 Years)</option>
                    <option value="senior">Senior (5+ Years)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <button
              onClick={startInterview}
              disabled={isGenerating}
              className="px-8 py-3.5 bg-[#171717] hover:bg-[#333333] text-white font-semibold text-sm rounded-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Assemble My Report <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {/* Calendar & History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Interviews Calendar */}
          <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-base font-semibold text-[#171717] flex items-center gap-3">
                <Calendar className="w-4.5 h-4.5 text-[#0070F3]" /> Interview Calendar
              </h2>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="px-3 py-1.5 bg-[#FAFAFA] border border-[#EBEBEB] text-[#171717] hover:bg-[#F2F2F2] rounded-md text-xs font-semibold transition-all"
              >
                + Add Interview
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {calendar.length > 0 ? (
                calendar.map((event, idx) => (
                  <div key={idx} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5 flex items-center justify-between group hover:border-[#171717]/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] flex flex-col items-center justify-center p-2 shrink-0 shadow-sm">
                        <span className="text-[9px] text-[#8F8F8F] font-bold uppercase leading-none">{new Date(event.interview_date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-[#171717] font-bold text-base leading-none mt-1">{new Date(event.interview_date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="text-[#171717] font-semibold text-sm tracking-tight">{event.company}</h4>
                        <p className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-wider mt-0.5">{event.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSetup({ ...setup, role: `${event.company} - ${event.role}` })}
                      className="p-2.5 hover:bg-[#FFFFFF] border border-transparent hover:border-[#EBEBEB] rounded-lg text-[#8F8F8F] opacity-0 group-hover:opacity-100 transition-all hover:text-[#171717] shadow-sm"
                      title="Prepare for this"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border border-dashed border-[#EBEBEB] rounded-xl bg-[#FAFAFA]">
                  <p className="text-[#8F8F8F] text-xs font-medium italic">Your upcoming interviews will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance History */}
          <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
            <h2 className="text-base font-semibold text-[#171717] flex items-center gap-3 mb-8">
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" /> Prep Statistics
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? (
                history.map((h, idx) => (
                  <div key={idx} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5 flex items-center justify-between hover:border-[#171717]/30 transition-all">
                    <div className="flex gap-4 items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${h.final_score && h.final_score > 70 ? 'bg-green-500 border border-green-200' : 'bg-orange-500 border border-orange-200'}`}></div>
                      <div>
                        <h4 className="text-[#171717] font-semibold text-sm">{h.role}</h4>
                        <p className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-wider mt-0.5">
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {h.final_score !== null && (
                        <div className="px-2.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-[#0070F3] text-xs font-bold font-mono">
                          {Math.round(h.final_score)}%
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setFinalReport(h.detailed_scores);
                          setSession({ isComplete: true } as unknown as InterviewSession);
                        }}
                        className="p-2 hover:bg-[#FFFFFF] border border-transparent hover:border-[#EBEBEB] rounded-lg text-[#8F8F8F] hover:text-[#171717] transition-all"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border border-dashed border-[#EBEBEB] rounded-xl bg-[#FAFAFA] text-[#8F8F8F] text-xs font-medium italic">
                  Complete your first mock interview to see stats.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Calendar Modal */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl max-w-md w-full p-8 shadow-xl relative text-[#171717]">
              <button onClick={() => setShowCalendarModal(false)} className="absolute top-6 right-6 p-2 hover:bg-[#FAFAFA] rounded-full text-[#8F8F8F] hover:text-[#171717]"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-6 uppercase italic">Schedule Interview</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider block mb-2 ml-1">Company Name</label>
                  <input
                    type="text"
                    value={calendarForm.company}
                    onChange={(e) => setCalendarForm({ ...calendarForm, company: e.target.value })}
                    className="w-full bg-[#FFFFFF] border-[#EBEBEB] border rounded-lg py-3 px-4 text-[#171717] outline-none focus:border-[#171717] transition-all text-sm font-medium"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider block mb-2 ml-1">Target Role</label>
                  <input
                    type="text"
                    value={calendarForm.role}
                    onChange={(e) => setCalendarForm({ ...calendarForm, role: e.target.value })}
                    className="w-full bg-[#FFFFFF] border-[#EBEBEB] border rounded-lg py-3 px-4 text-[#171717] outline-none focus:border-[#171717] transition-all text-sm font-medium"
                    placeholder="Systems Engineer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider block mb-2 ml-1">Interview Date</label>
                  <input
                    type="date"
                    value={calendarForm.date}
                    onChange={(e) => setCalendarForm({ ...calendarForm, date: e.target.value })}
                    className="w-full bg-[#FFFFFF] border-[#EBEBEB] border rounded-lg py-3 px-4 text-[#171717] outline-none focus:border-[#171717] transition-all text-sm font-medium"
                  />
                </div>
                <button
                  onClick={addToCalendar}
                  className="w-full py-3 bg-[#171717] hover:bg-[#333333] text-white font-semibold rounded-md transition-all shadow-sm active:scale-[0.98] mt-4 text-sm"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!session) return null;

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const questionNumber = session.currentQuestionIndex + 1;
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-premium-in pb-20 text-[#171717]">
      <div className="text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/5 border border-[#0070F3]/10 text-[#0070F3] text-[10px] font-bold uppercase tracking-widest mb-4">
          <Target className="w-3 h-3" /> Live Simulation Mode
        </div>
        <h1 className="text-4xl font-semibold text-[#171717] mb-2 tracking-tight uppercase italic font-sans">AI Mock Interview</h1>
        <div className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-[0.2em] font-mono mt-1">
          Ecosystem Signal {questionNumber} / {session.questions.length}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-8 relative shadow-inner">
          <p className="text-xl text-[#171717] font-medium leading-relaxed pr-12 italic">&quot;{currentQuestion}&quot;</p>
          {session.interviewMode === 'voice' && (
            <button
              onClick={() => speak(currentQuestion)}
              className="absolute top-6 right-6 p-2.5 bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] rounded-lg text-[#8F8F8F] hover:text-[#171717] transition-all shadow-sm active:scale-[0.95]"
              title="Speak question again"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">
          Your Answer
        </label>
        {session.interviewMode === 'chat' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#EBEBEB] rounded-lg text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] transition-all text-sm font-medium focus:ring-0 outline-none"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={toggleRecording}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-md font-semibold transition-all text-sm active:scale-[0.98] ${isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#171717] hover:bg-[#333333] text-white'
                  }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Start Speaking'}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {isSpeaking && (
                <div className="flex items-center gap-2 text-[#0070F3] font-semibold text-xs animate-pulse">
                  <div className="w-1.5 h-1.5 bg-[#0070F3] rounded-full"></div>
                  AI is speaking...
                </div>
              )}
            </div>

            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-6 min-h-[150px] relative">
              <div className="absolute top-4 left-4 text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider">
                Transcript Preview
              </div>
              <p className={`mt-6 text-base font-medium leading-relaxed ${currentAnswer ? 'text-[#171717]' : 'text-[#8F8F8F] italic'}`}>
                {currentAnswer || (isRecording ? "Listening... start speaking your answer." : "Click 'Start Speaking' and describe your answer.")}
              </p>
            </div>

            {session.evaluations.length > 0 && session.currentQuestionIndex > 0 && (
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-5 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-700">Feedback for Question {session.currentQuestionIndex}</span>
                  <span className={`text-sm font-bold ${session.evaluations[session.evaluations.length - 1].score >= 7 ? 'text-green-600' : 'text-amber-600'}`}>
                    Score: {session.evaluations[session.evaluations.length - 1].score}/10
                  </span>
                </div>
                <p className="text-[#4D4D4D] text-sm mb-2">{session.evaluations[session.evaluations.length - 1].feedback}</p>
                <p className="text-[#8F8F8F] text-xs italic font-medium">{session.evaluations[session.evaluations.length - 1].tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={submitAnswer}
          disabled={isEvaluating || !currentAnswer.trim()}
          className="px-8 py-3 bg-[#171717] hover:bg-[#333333] text-white font-semibold text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvaluating ? 'Evaluating...' : session.interviewMode === 'voice' ? (isLastQuestion ? 'Submit & Finish' : 'Submit & Next Question') : 'Submit Answer'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm font-semibold">
          {error}
        </div>
      )}
      {session.evaluations.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
          <h3 className="text-base font-semibold text-[#171717] mb-6">Previous Feedback</h3>
          <div className="space-y-4">
            {session.evaluations.map((evaluation: QuestionEvaluation, index: number) => (
              <div key={index} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#171717]">Question {index + 1}</span>
                  <span className={`font-bold text-sm ${evaluation.score >= 7 ? 'text-green-600' : evaluation.score >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                    Score: {evaluation.score}/10
                  </span>
                </div>
                <p className="text-[#4D4D4D] text-sm mb-2">{evaluation.feedback}</p>
                <p className="text-[#8F8F8F] text-xs font-medium italic">{evaluation.tips}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
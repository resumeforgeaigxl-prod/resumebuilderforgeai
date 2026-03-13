'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Mic, CheckCircle, ArrowRight, RotateCcw, FileText, Target, Calendar, BarChart, TrendingUp, X, Award, Lightbulb, Clock, Layers } from 'lucide-react';
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
    <Suspense fallback={<div>Loading company prep setup...</div>}>
      <CompanyPrepInterviewContent />
    </Suspense>
  );
}

function CompanyPrepInterviewContent() {
  const params = useParams() as { region: string; lang: string };
  const { region, lang } = params;
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
          window.location.href = `/${region}/${lang}/login`;
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
  }, [region, lang]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !session && error.includes('limit')) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-red-400 font-bold text-lg mb-2">Access Limited</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link
            href={`/${region}/${lang}/billing`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (intelligenceReport && !session) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              < Award className="w-3 h-3" /> Interview Intelligence Report
            </div>
            <h1 className="text-4xl font-black text-white">{intelligenceReport.company}</h1>
            <p className="text-xl text-slate-400 mt-1">{intelligenceReport.role}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Difficulty</p>
                <p className="text-white font-bold">{intelligenceReport.difficulty_level}</p>
              </div>
            </div>
            <button
              onClick={launchMockSession}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? 'Initializing...' : <>Start Mock Interview <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Process & Roadmap */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hiring Process Section */}
            <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Layers className="w-32 h-32 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                Process Breakdown
              </h2>
              <div className="space-y-6 relative">
                {intelligenceReport.hiring_process.map((round, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:border-indigo-500 group-hover:text-white transition-colors">
                        {idx + 1}
                      </div>
                      {idx !== intelligenceReport.hiring_process.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-700/50 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <h3 className="text-white font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">{round.round_name}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-2">{round.details}</p>
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-slate-500 font-bold uppercase tracking-tighter italic">Difficulty: {round.expected_difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prep Roadmap Section */}
            <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                4-Day Prep Roadmap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligenceReport.prep_roadmap.map((day, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Day {day.day}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {day.topics.map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{t}</span>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {day.tasks.map((task, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2 italic">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
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
            <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <BarChart className="w-4 h-4 text-purple-400" /> Topic Focus
              </h2>
              <div className="space-y-5">
                {intelligenceReport.topic_heatmap.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400 font-medium">{item.topic}</span>
                      <span className="text-white font-bold">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500 italic leading-relaxed text-center">
                  AI has analyzed 500+ interview experiences to generate this distribution.
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-6">
              <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4" /> Pro Tip
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                {intelligenceReport.company} interviews often focus heavily on <strong>{intelligenceReport.topic_heatmap[0]?.topic}</strong>. Ensure you can explain your previous projects using the STAR method.
              </p>
              <button
                onClick={launchMockSession}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
              >
                Test My Readiness
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Questions Database */}
        <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white">Top Questions Database</h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{intelligenceReport.top_questions.length} Aggregated Questions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intelligenceReport.top_questions.map((q, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-all cursor-pointer group" onClick={() => setShowCoachFor(idx)}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    q.difficulty === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {q.difficulty}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400`}>
                    {q.frequency} Frequency
                  </span>
                </div>
                <p className="text-slate-100 font-bold text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-indigo-400 transition-colors italic">&quot;{q.question}&quot;</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{q.topic}</span>
                  <span className="text-[10px] text-indigo-400 font-black uppercase flex items-center gap-1">Coach<ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Coach Modal */}
        {showCoachFor !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
              <button
                onClick={() => setShowCoachFor(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mb-8">
                <h1 className="text-xl font-black text-white mb-2 leading-relaxed">Question</h1>
                <div className="p-4 bg-white/5 border-l-4 border-indigo-500 rounded-r-xl">
                  <p className="text-lg text-slate-200 italic">&quot;{intelligenceReport.top_questions[showCoachFor].question}&quot;</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Ideal Structure
                  </h3>
                  <div className="space-y-3">
                    {intelligenceReport.top_questions[showCoachFor].answer_coach.ideal_structure.map((step, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">{i + 1}</div>
                        <p className="text-slate-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4">Example Master Answer</h3>
                  <div className="bg-slate-800/40 border border-emerald-500/20 p-5 rounded-2xl">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">&quot;{intelligenceReport.top_questions[showCoachFor].answer_coach.example_answer}&quot;</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Common Pitfalls</h3>
                  <ul className="space-y-2">
                    {intelligenceReport.top_questions[showCoachFor].answer_coach.common_mistakes.map((mistake, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-3">
                        <X className="w-3 h-3 text-red-500 mt-1 shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                <button
                  onClick={() => setShowCoachFor(null)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
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

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
            <Mic className="w-4 h-4" />
            AI Interview Intelligence
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">Intelligence System</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Generate an &quot;Intelligence Report&quot; for your dream company. See hiring rounds, real questions, and focus areas.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                Company & Target Role
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={setup.role}
                  onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                  placeholder="e.g. Google - Product Manager"
                  className="w-full px-8 py-6 bg-slate-900/50 border border-white/10 rounded-2xl text-xl text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                  <Target className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-500 px-2 italic">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Input format: Corporate Name - Vertical (e.g. Netflix - Backend)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                  Engagement Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSetup({ ...setup, interviewMode: 'chat' })}
                    className={`flex-1 relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${setup.interviewMode === 'chat'
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                  >
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-black text-xs uppercase">Chat</div>
                      <div className="text-[10px] opacity-60">Text-based</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSetup({ ...setup, interviewMode: 'voice' })}
                    className={`flex-1 relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${setup.interviewMode === 'voice'
                      ? 'bg-purple-600/10 border-purple-500 text-white'
                      : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                  >
                    <Mic className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-black text-xs uppercase">Voice</div>
                      <div className="text-[10px] opacity-60">Speech-to-Text</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                  Experience Context
                </label>
                <select
                  value={setup.experienceLevel}
                  onChange={(e) => setSetup({ ...setup, experienceLevel: e.target.value })}
                  className="w-full px-6 py-5 bg-slate-900/50 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="intern">Intern / New Grad</option>
                  <option value="junior">Junior (1-3 Years)</option>
                  <option value="mid">Mid (3-5 Years)</option>
                  <option value="senior">Senior (5+ Years)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <button
              onClick={startInterview}
              disabled={isGenerating}
              className="group relative px-16 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-black text-xl rounded-2xl transition-all duration-500 shadow-2xl shadow-indigo-500/25 flex items-center gap-4 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? 'Assembling Intelligence...' : <>Assemble My Report <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
        </div>

        {/* Calendar & History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Interviews Calendar */}
          <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white flex items-center gap-3 italic">
                <Calendar className="w-5 h-5 text-indigo-400" /> Interview Calendar
              </h2>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all"
              >
                + Add Interview
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {calendar.length > 0 ? (
                calendar.map((event, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(event.interview_date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-white font-black text-lg leading-none">{new Date(event.interview_date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm tracking-tight">{event.company}</h4>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{event.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSetup({ ...setup, role: `${event.company} - ${event.role}` })}
                      className="p-3 bg-white/5 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-white"
                      title="Prepare for this"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-slate-500 text-sm font-medium italic">Your upcoming interviews will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance History */}
          <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-8 italic">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Prep Statistics
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? (
                history.map((h, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className={`w-2 h-2 rounded-full ${h.final_score && h.final_score > 70 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{h.role}</h4>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {h.final_score !== null && (
                        <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-black italic">
                          {Math.round(h.final_score)}%
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setFinalReport(h.detailed_scores);
                          setSession({ isComplete: true } as unknown as InterviewSession);
                        }}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 text-sm italic">
                  Complete your first mock interview to see stats.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Calendar Modal */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative">
              <button onClick={() => setShowCalendarModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-black text-white mb-6 uppercase italic">Schedule Interview</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Company Name</label>
                  <input
                    type="text"
                    value={calendarForm.company}
                    onChange={(e) => setCalendarForm({ ...calendarForm, company: e.target.value })}
                    className="w-full bg-slate-950 border-white/10 border rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500 transition-all"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Target Role</label>
                  <input
                    type="text"
                    value={calendarForm.role}
                    onChange={(e) => setCalendarForm({ ...calendarForm, role: e.target.value })}
                    className="w-full bg-slate-950 border-white/10 border rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500 transition-all"
                    placeholder="Systems Engineer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Interview Date</label>
                  <input
                    type="date"
                    value={calendarForm.date}
                    onChange={(e) => setCalendarForm({ ...calendarForm, date: e.target.value })}
                    className="w-full bg-slate-950 border-white/10 border rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <button
                  onClick={addToCalendar}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 mt-4"
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

  if (session.isComplete) {
    const report = finalReport;

    return (
      <div className="max-w-5xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-20">
        <div className="text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Interview Evaluated</h1>
          <p className="text-slate-400 text-lg">Detailed analysis of your performance at {intelligenceReport?.company}</p>
        </div>

        {report ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Scorecard */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-slate-800/40 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-900" />
                      <circle
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - report.overall_readiness / 100)}
                        className="text-indigo-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white">{report.overall_readiness}%</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ready</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Technical', val: report.technical, color: 'bg-blue-500' },
                        { label: 'Communication', val: report.communication, color: 'bg-purple-500' },
                        { label: 'Problem Solving', val: report.problem_solving, color: 'bg-emerald-500' },
                        { label: 'Confidence', val: report.confidence, color: 'bg-amber-500' }
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500 uppercase font-black">{item.label}</span>
                            <span className="text-white font-bold">{item.val}/10</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Improvement Roadmap
                </h2>
                <div className="space-y-4">
                  {report.improvement_suggestions.map((suggestion: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">&quot;{suggestion}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <Award className="w-10 h-10 mb-6 opacity-50" />
                <h3 className="text-2xl font-black leading-tight mb-2">Candidate Comparison</h3>
                <p className="text-white/70 text-sm mb-8 leading-relaxed">Based on current market data for {intelligenceReport?.role} roles.</p>
                <div className="text-5xl font-black mb-2">{report.readiness_comparison_percentile}%</div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Better than other applicants</p>
                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Insight</p>
                  <p className="text-sm mt-1 italic">&quot;You are in the top tier for problem solving. Focus on communication to lock the offer.&quot;</p>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6">Action Items</h3>
                <div className="space-y-4">
                  <Link
                    href={`/${region}/${lang}/resumes`}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-bold transition-all text-sm group"
                  >
                    Optimize Resume <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={resetInterview}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-bold transition-all text-sm group"
                  >
                    Try Another Mode <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 border border-white/5 rounded-[2.5rem]">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold">Synthesizing Final Report...</p>
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">AI Mock Interview</h1>
        <div className="text-slate-400">
          Question {questionNumber} of {session.questions.length}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
        <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6 relative group">
          <p className="text-lg text-slate-200 leading-relaxed pr-12">{currentQuestion}</p>
          {session.interviewMode === 'voice' && (
            <button
              onClick={() => speak(currentQuestion)}
              className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-indigo-400 transition-colors"
              title="Speak question again"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Answer
        </label>
        {session.interviewMode === 'chat' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleRecording}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Start Speaking'}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>

              {isSpeaking && (
                <div className="flex items-center gap-2 text-indigo-400 font-medium animate-pulse">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  AI is speaking...
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6 min-h-[150px] relative">
              <div className="absolute top-4 left-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Transcript Preview
              </div>
              <p className={`mt-6 text-lg ${currentAnswer ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                {currentAnswer || (isRecording ? "Listening... start speaking your answer." : "Click 'Start Speaking' and describe your answer.")}
              </p>
            </div>

            {session.evaluations.length > 0 && session.currentQuestionIndex > 0 && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-300">Feedback for Question {session.currentQuestionIndex}</span>
                  <span className={`text-sm font-bold ${session.evaluations[session.evaluations.length - 1].score >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                    Score: {session.evaluations[session.evaluations.length - 1].score}/10
                  </span>
                </div>
                <p className="text-slate-200 text-sm mb-1">{session.evaluations[session.evaluations.length - 1].feedback}</p>
                <p className="text-slate-400 text-xs italic">{session.evaluations[session.evaluations.length - 1].tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={submitAnswer}
          disabled={isEvaluating || !currentAnswer.trim()}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvaluating ? 'Evaluating...' : session.interviewMode === 'voice' ? (isLastQuestion ? 'Submit & Finish' : 'Submit & Next Question') : 'Submit Answer'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}
      {session.evaluations.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Previous Feedback</h3>
          <div className="space-y-4">
            {session.evaluations.map((evaluation: QuestionEvaluation, index: number) => (
              <div key={index} className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Question {index + 1}</span>
                  <span className={`font-bold ${evaluation.score >= 7 ? 'text-green-400' : evaluation.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    Score: {evaluation.score}/10
                  </span>
                </div>
                <p className="text-slate-200 mb-2">{evaluation.feedback}</p>
                <p className="text-slate-400 text-sm">{evaluation.tips}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
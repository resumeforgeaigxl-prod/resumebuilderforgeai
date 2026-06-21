'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Mic, CheckCircle, ArrowRight, RotateCcw, FileText, Target } from 'lucide-react';
import { FeatureGate } from '@/components/pricing/FeatureGate';
import Link from 'next/link';

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

export default function MockInterviewPage() {
  return (
    <Suspense fallback={<div>Loading interview setup...</div>}>
      <FeatureGate task="interview">
        <MockInterviewContent />
      </FeatureGate>
    </Suspense>
  );
}

import { ForgeSoftPaywall } from '@/components/auth/ForgeSoftPaywall';

function MockInterviewContent() {
  const params = useParams() as { locale: string };
  const { locale } = params;
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') || '';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [setup, setSetup] = useState<InterviewSetup>({
    role: initialRole,
    jobDescription: '',
    experienceLevel: 'junior',
    interviewType: 'technical',
    numQuestions: 10,
    interviewMode: 'chat'
  });
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const res = await fetch('/api/mock-interview');
        const data = await res.json();

        if (res.status === 401) {
          window.location.href = `/${locale}/login`;
          return;
        }

        if (data.limitReached) {
          setShowPaywall(true);
          setLoading(false);
          return;
        }

        if (data.error) {
          setError(data.error);
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error('Access check failed:', err);
        setError('Failed to verify access');
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
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
      // PostHog Tracking
      try {
        const posthog = (await import('@/lib/posthog')).default;
        posthog.capture('mock_test_started', {
          user_id: user.id,
          job_role: setup.role,
          experience_level: setup.experienceLevel,
          interview_type: setup.interviewType,
          interview_mode: setup.interviewMode
        });
      } catch (e) {
        console.error('[PostHog] Event error:', e);
      }

      const genRes = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-questions',
          role: setup.role,
          jobDescription: setup.jobDescription,
          experienceLevel: setup.experienceLevel,
          interviewType: setup.interviewType,
          numQuestions: setup.numQuestions
        })
      });

      const genData = await genRes.json();
      if (genData.error) throw new Error(genData.error);

      const questions = genData.questions;

      const res = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          role: setup.role,
          jobDescription: setup.jobDescription,
          experienceLevel: setup.experienceLevel,
          interviewType: setup.interviewType,
          numQuestions: setup.numQuestions,
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
        speak(`Hello. Welcome to your AI mock interview. I will ask you a series of questions related to your selected job role. Question 1: ${questions[0]}`);
      }
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError('Failed to generate interview questions. Please try again.');
    } finally {
      setIsGenerating(false);
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
      let finalScore: number | undefined;

      if (isComplete) {
        const totalScore = newEvaluations.reduce((sum: number, e: QuestionEvaluation) => sum + e.score, 0);
        finalScore = (totalScore / newEvaluations.length) * 10;

        // PostHog Tracking
        try {
          const posthog = (await import('@/lib/posthog')).default;
          posthog.capture('mock_test_completed', {
            user_id: user?.id,
            interview_id: session.id,
            final_score: finalScore,
            job_role: setup.role,
            interview_mode: setup.interviewMode
          });
        } catch (e) {
          console.error('[PostHog] Event error:', e);
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
          finalScore
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
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#171717]"></div>
      </div>
    );
  }

  if (error && !session && error.includes('limit')) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-6 shadow-sm">
          <h2 className="text-red-600 font-semibold text-lg mb-2">Access Limited</h2>
          <p className="text-[#4D4D4D] mb-4">{error}</p>
          <Link
            href={`/${locale}/dashboard/billing`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] hover:bg-[#333333] text-white rounded-md font-medium text-sm transition-all"
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (showPaywall) {
    return <ForgeSoftPaywall forgeName="InterviewForge" />;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAFAFA] border border-[#EBEBEB] text-[#4D4D4D] text-xs font-medium rounded-full mb-4">
            <Mic className="w-3.5 h-3.5" />
            AI Interview Coach
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717] mb-4">AI Mock Interview</h1>
          <p className="text-[#4D4D4D] max-w-2xl mx-auto text-base">
            Practice realistic job interviews powered by AI. Get instant feedback and improve your interview performance.
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[#171717] mb-6">Setup Your Interview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Target Job Role *
              </label>
              <input
                type="text"
                value={setup.role}
                onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                placeholder="e.g. Software Engineer, Product Manager"
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] focus:outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Experience Level
              </label>
              <select
                value={setup.experienceLevel}
                onChange={(e) => setSetup({ ...setup, experienceLevel: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] focus:border-[#171717] focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value="fresher">Fresher (0-2 years)</option>
                <option value="junior">Junior (2-5 years)</option>
                <option value="experienced">Experienced (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Interview Type
              </label>
              <select
                value={setup.interviewType}
                onChange={(e) => setSetup({ ...setup, interviewType: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] focus:border-[#171717] focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value="technical">Technical</option>
                <option value="hr">HR & Behavioral</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Number of Questions
              </label>
              <select
                value={setup.numQuestions}
                onChange={(e) => setSetup({ ...setup, numQuestions: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] focus:border-[#171717] focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#171717] mb-4">
                Interview Mode
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSetup({ ...setup, interviewMode: 'chat' })}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border transition-all ${setup.interviewMode === 'chat'
                    ? 'bg-[#FAFAFA] border-[#171717] text-[#171717] shadow-sm font-semibold'
                    : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                    }`}
                >
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Chat Interview</div>
                    <div className="text-xs opacity-60">Text-based Q&A</div>
                  </div>
                </button>
                <button
                  onClick={() => setSetup({ ...setup, interviewMode: 'voice' })}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border transition-all ${setup.interviewMode === 'voice'
                    ? 'bg-[#FAFAFA] border-[#171717] text-[#171717] shadow-sm font-semibold'
                    : 'bg-[#FFFFFF] border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA]'
                    }`}
                >
                  <Mic className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Voice Interview</div>
                    <div className="text-xs opacity-60">Live voice Q&A</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-[#171717] mb-2">
              Job Description (Optional)
            </label>
            <textarea
              value={setup.jobDescription}
              onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })}
              placeholder="Paste the job description to generate more relevant questions..."
              rows={4}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] focus:outline-none transition-all text-sm"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={startInterview}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGenerating ? 'Generating Questions...' : 'Start Interview'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (session.isComplete) {
    const totalScore = session.evaluations.reduce((sum, e) => sum + e.score, 0);
    const averageScore = totalScore / session.evaluations.length;
    const finalPercentage = Math.round(averageScore * 10);

    const strengths = session.evaluations
      .filter((e: QuestionEvaluation) => e.score >= 7)
      .map((e: QuestionEvaluation, i: number) => `Question ${i + 1}`)
      .slice(0, 3);

    const weaknesses = session.evaluations
      .filter((e: QuestionEvaluation) => e.score < 7)
      .map((e: QuestionEvaluation, i: number) => `Question ${i + 1}`)
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-[#171717] mx-auto mb-4" />
          <h1 className="text-3xl font-semibold tracking-tighter text-[#171717] mb-4">Interview Complete!</h1>
          <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-[#171717] mb-2">{finalPercentage}%</div>
              <div className="text-[#8F8F8F] text-sm">Overall Score</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-[#171717] mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {strengths.length > 0 ? (
                    strengths.map((q: string, i: number) => (
                      <li key={i} className="text-[#4D4D4D] text-sm">• {q} - Well answered</li>
                    ))
                  ) : (
                    <li className="text-[#8F8F8F] text-sm">Keep practicing to build strengths</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#171717] mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {weaknesses.length > 0 ? (
                    weaknesses.map((q: string, i: number) => (
                      <li key={i} className="text-[#4D4D4D] text-sm">• {q} - Needs more detail</li>
                    ))
                  ) : (
                    <li className="text-[#8F8F8F] text-sm">Great job! No major weaknesses found</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={`/${locale}/resumes`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] hover:bg-[#333333] text-white rounded-md font-medium text-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                Improve Your Resume
              </Link>
              <Link
                href={`/${locale}/tools`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#171717] rounded-md font-medium text-sm transition-all shadow-sm"
              >
                <Target className="w-4 h-4" />
                Analyze Job Description
              </Link>
              <button
                onClick={resetInterview}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#171717] rounded-md font-medium text-sm transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Start Another Interview
              </button>
            </div>
          </div>
        </div>
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
        <h1 className="text-3xl font-semibold tracking-tighter text-[#171717] mb-4">AI Mock Interview</h1>
        <div className="text-[#8F8F8F] text-sm">
          Question {questionNumber} of {session.questions.length}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 shadow-sm">
        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-6 relative">
          <p className="text-lg text-[#171717] leading-relaxed pr-12">{currentQuestion}</p>
          {session.interviewMode === 'voice' && (
            <button
              onClick={() => speak(currentQuestion)}
              className="absolute top-6 right-6 p-2 bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] rounded-md text-[#171717] transition-all shadow-sm"
              title="Speak question again"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#171717] mb-2">
          Your Answer
        </label>
        {session.interviewMode === 'chat' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#EBEBEB] rounded-md text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] focus:outline-none transition-all text-sm"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleRecording}
                className={`relative flex items-center gap-3 px-6 py-2.5 rounded-md font-medium text-sm transition-all shadow-sm ${isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#171717]'
                  }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
                {isRecording ? 'Stop Recording' : 'Start Speaking'}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>

              {isSpeaking && (
                <div className="flex items-center gap-2 text-[#4D4D4D] text-sm animate-pulse">
                  <div className="w-2 h-2 bg-[#171717] rounded-full"></div>
                  AI is speaking...
                </div>
              )}
            </div>

            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-6 min-h-[150px] relative">
              <div className="absolute top-4 left-4 text-xs font-mono text-[#8F8F8F] uppercase tracking-wider">
                Transcript Preview
              </div>
              <p className={`mt-6 text-lg ${currentAnswer ? 'text-[#171717]' : 'text-[#8F8F8F] italic'}`}>
                {currentAnswer || (isRecording ? "Listening... start speaking your answer." : "Click 'Start Speaking' and describe your answer.")}
              </p>
            </div>

            {session.evaluations.length > 0 && session.currentQuestionIndex > 0 && (
              <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#171717]">Feedback for Question {session.currentQuestionIndex}</span>
                  <span className={`text-sm font-bold ${session.evaluations[session.evaluations.length - 1].score >= 7 ? 'text-green-700' : 'text-yellow-700'}`}>
                    Score: {session.evaluations[session.evaluations.length - 1].score}/10
                  </span>
                </div>
                <p className="text-[#4D4D4D] text-sm mb-1">{session.evaluations[session.evaluations.length - 1].feedback}</p>
                <p className="text-[#8F8F8F] text-xs italic">{session.evaluations[session.evaluations.length - 1].tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={submitAnswer}
          disabled={isEvaluating || !currentAnswer.trim()}
          className="px-6 py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isEvaluating ? 'Evaluating...' : session.interviewMode === 'voice' ? (isLastQuestion ? 'Submit & Finish' : 'Submit & Next Question') : 'Submit Answer'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      {session.evaluations.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#171717] mb-4">Previous Feedback</h3>
          <div className="space-y-4">
            {session.evaluations.map((evaluation: QuestionEvaluation, index: number) => (
              <div key={index} className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#4D4D4D] font-medium text-sm">Question {index + 1}</span>
                  <span className={`font-bold ${evaluation.score >= 7 ? 'text-green-700' : evaluation.score >= 5 ? 'text-yellow-700' : 'text-red-700'}`}>
                    Score: {evaluation.score}/10
                  </span>
                </div>
                <p className="text-[#4D4D4D] text-sm mb-2">{evaluation.feedback}</p>
                <p className="text-[#8F8F8F] text-sm">{evaluation.tips}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
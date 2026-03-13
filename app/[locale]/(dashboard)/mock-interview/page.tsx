'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Mic, CheckCircle, ArrowRight, RotateCcw, FileText, Target } from 'lucide-react';
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
      <MockInterviewContent />
    </Suspense>
  );
}

function MockInterviewContent() {
  const params = useParams() as { locale: string };
  const { locale } = params;
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') || '';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

        if (data.error) {
          setError(data.error);
          return;
        }

        if (data.user.interviewsUsed >= data.user.interviewLimit) {
          setError(`You've reached your daily limit of ${data.user.interviewLimit} interviews. Upgrade your plan for more interviews.`);
          setUser(data.user); // Store to show correct stats if needed
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
            href={`/${locale}/billing`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
          >
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
            <Mic className="w-4 h-4" />
            AI Interview Coach
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">AI Mock Interview</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Practice realistic job interviews powered by AI. Get instant feedback and improve your interview performance.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Setup Your Interview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Job Role *
              </label>
              <input
                type="text"
                value={setup.role}
                onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                placeholder="e.g. Software Engineer, Product Manager"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Experience Level
              </label>
              <select
                value={setup.experienceLevel}
                onChange={(e) => setSetup({ ...setup, experienceLevel: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="fresher">Fresher (0-2 years)</option>
                <option value="junior">Junior (2-5 years)</option>
                <option value="experienced">Experienced (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Interview Type
              </label>
              <select
                value={setup.interviewType}
                onChange={(e) => setSetup({ ...setup, interviewType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="technical">Technical</option>
                <option value="hr">HR & Behavioral</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Questions
              </label>
              <select
                value={setup.numQuestions}
                onChange={(e) => setSetup({ ...setup, numQuestions: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Interview Mode
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSetup({ ...setup, interviewMode: 'chat' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border transition-all ${setup.interviewMode === 'chat'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">Chat Interview</div>
                    <div className="text-xs opacity-60">Text-based Q&A</div>
                  </div>
                </button>
                <button
                  onClick={() => setSetup({ ...setup, interviewMode: 'voice' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border transition-all ${setup.interviewMode === 'voice'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                >
                  <Mic className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">Voice Interview</div>
                    <div className="text-xs opacity-60">Live voice Q&A</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Description (Optional)
            </label>
            <textarea
              value={setup.jobDescription}
              onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })}
              placeholder="Paste the job description to generate more relevant questions..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={startInterview}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Questions...' : 'Start Interview'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
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
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Interview Complete!</h1>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-indigo-400 mb-2">{finalPercentage}%</div>
              <div className="text-slate-400">Overall Score</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {strengths.length > 0 ? (
                    strengths.map((q: string, i: number) => (
                      <li key={i} className="text-slate-300">• {q} - Well answered</li>
                    ))
                  ) : (
                    <li className="text-slate-400">Keep practicing to build strengths</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-orange-400 mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {weaknesses.length > 0 ? (
                    weaknesses.map((q: string, i: number) => (
                      <li key={i} className="text-slate-300">• {q} - Needs more detail</li>
                    ))
                  ) : (
                    <li className="text-slate-400">Great job! No major weaknesses found</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={`/${locale}/resumes`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                <FileText className="w-4 h-4" />
                Improve Your Resume
              </Link>
              <Link
                href={`/${locale}/tools`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all"
              >
                <Target className="w-4 h-4" />
                Analyze Job Description
              </Link>
              <button
                onClick={resetInterview}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
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
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { generateAIResponse, stripMarkdown } from '@/lib/ai-provider';
import { Mic, CheckCircle, ArrowRight, RotateCcw, FileText, Target } from 'lucide-react';
import Link from 'next/link';

interface InterviewSetup {
  role: string;
  jobDescription: string;
  experienceLevel: string;
  interviewType: string;
  numQuestions: number;
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
  const params = useParams() as { region: string; lang: string };
  const { region, lang } = params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState<InterviewSetup>({
    role: '',
    jobDescription: '',
    experienceLevel: 'junior',
    interviewType: 'technical',
    numQuestions: 10
  });
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const res = await fetch('/api/mock-interview');
        const data = await res.json();

        if (res.status === 401) {
          window.location.href = `/${region}/${lang}/login`;
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
      const prompt = `Generate ${setup.numQuestions} interview questions for a ${setup.experienceLevel} level ${setup.interviewType} interview for the role: ${setup.role}.

Job Description: ${setup.jobDescription || 'Not provided'}

Questions should be relevant to the role and experience level. Return only a JSON array of question strings, no other text.

Example: ["Question 1", "Question 2", "Question 3"]`;

      const response = await generateAIResponse(prompt);
      const cleanText = stripMarkdown(response.text);
      let questions;

      try {
        questions = JSON.parse(cleanText);
      } catch (e) {
        console.error('Failed to parse questions:', e, cleanText);
        throw new Error('AI returned an invalid format. Please try again.');
      }

      if (!Array.isArray(questions)) {
        throw new Error('Invalid response format: not an array');
      }

      if (questions.length === 0) {
        throw new Error('AI failed to generate any questions');
      }

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
          questions: questions
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
        isComplete: false
      });
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
      const prompt = `Evaluate this interview answer on a scale of 0-10.

Question: ${question}
Answer: ${currentAnswer}

Return a JSON object with:
- score: number (0-10)
- feedback: string (brief feedback on the answer)
- tips: string (improvement suggestions)

Example: {"score": 7, "feedback": "Good explanation but could be more specific", "tips": "Add examples from your experience"}`;

      const response = await generateAIResponse(prompt);
      const cleanText = stripMarkdown(response.text);
      let evaluation: QuestionEvaluation;

      try {
        evaluation = JSON.parse(cleanText);
      } catch (e) {
        console.error('Failed to parse evaluation:', e, cleanText);
        throw new Error('AI returned an invalid evaluation. Please try again.');
      }

      const newAnswers = [...session.answers, currentAnswer];
      const newEvaluations = [...session.evaluations, evaluation];

      const nextIndex = session.currentQuestionIndex + 1;
      const isComplete = nextIndex >= session.questions.length;
      let finalScore: number | undefined;

      if (isComplete) {
        const totalScore = newEvaluations.reduce((sum: number, e: QuestionEvaluation) => sum + e.score, 0);
        finalScore = (totalScore / newEvaluations.length) * 10;
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
                href={`/${region}/${lang}/resumes`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                <FileText className="w-4 h-4" />
                Improve Your Resume
              </Link>
              <Link
                href={`/${region}/${lang}/tools`}
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

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const questionNumber = session.currentQuestionIndex + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">AI Mock Interview</h1>
        <div className="text-slate-400">
          Question {questionNumber} of {session.questions.length}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Question {questionNumber}
          </h2>
          <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
            <p className="text-lg text-slate-200 leading-relaxed">{currentQuestion}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={submitAnswer}
            disabled={isEvaluating || !currentAnswer.trim()}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
      </div>

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
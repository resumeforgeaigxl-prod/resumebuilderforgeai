'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import { Mic, Loader2, Search, Calendar, User, Briefcase, Eye, Trash2, BarChart3, Target, TrendingUp, Building2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface PrepData {
    company: string;
    role: string;
    difficulty_level: string;
    hiring_process: Array<{ round_name: string; details: string; expected_difficulty: string }>;
    top_questions: Array<{
        question: string;
        topic: string;
        difficulty: string;
        frequency: string;
        answer_coach: {
            ideal_structure: string[];
            example_answer: string;
            common_mistakes: string[];
        }
    }>;
    prep_roadmap: Array<{ day: number; topics: string[]; tasks: string[] }>;
}

interface InterviewRow {
    id: string;
    role: string;
    job_description: string;
    experience_level: string;
    interview_type: string;
    num_questions: number;
    questions: string[];
    answers: string[];
    scores: Array<{ score: number; feedback: string; tips: string }>;
    final_score: number;
    created_at: string;
    user_email: string;
    user_name: string;
    complete_prep?: PrepData;
}

interface Metrics {
    totalInterviews: number;
    interviewsToday: number;
    averageScore: string;
    mostPopularRole: string;
}

export default function AdminCompanyPrepPage() {
    const [interviews, setInterviews] = useState<InterviewRow[]>([]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedInterview, setSelectedInterview] = useState<InterviewRow | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    async function loadInterviews() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/company-prep');
            const data = await res.json();
            if (data.success) {
                const formattedInterviews = data.interviews.map((interview: InterviewRow) => {
                    if (interview.interview_type === 'Company Prep' && interview.job_description?.startsWith('{')) {
                        try {
                            return {
                                ...interview,
                                complete_prep: JSON.parse(interview.job_description)
                            };
                        } catch (e) {
                            console.error('Failed to parse complete prep:', e);
                        }
                    }
                    return interview;
                });
                setInterviews(formattedInterviews);
                setMetrics(data.metrics);
            }
        } catch (error) {
            console.error('Failed to load interviews:', error);
        }
        setLoading(false);
    }

    async function deleteInterview(id: string) {
        if (!confirm('Are you sure you want to delete this interview?')) return;

        try {
            const res = await fetch('/api/admin/company-prep', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                loadInterviews();
            }
        } catch (error) {
            console.error('Failed to delete interview:', error);
        }
    }

    useEffect(() => { loadInterviews(); }, []);

    const filtered = interviews.filter(interview =>
        interview.role?.toLowerCase().includes(search.toLowerCase()) ||
        interview.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        interview.user_name?.toLowerCase().includes(search.toLowerCase())
    );

    const viewInterview = (interview: InterviewRow) => {
        setSelectedInterview(interview);
        setShowDetail(true);
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mic className="w-6 h-6 text-purple-600" />
                        Company Prep Logs
                    </h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">
                        {interviews.length} prep guides generated
                    </p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search role, user name or email…"
                        className="pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Metrics Cards */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold text-[#171717]">{metrics.totalInterviews}</p>
                                <p className="text-[#8F8F8F] text-sm">Total Generated</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-green-400" />
                            <div>
                                <p className="text-2xl font-bold text-[#171717]">{metrics.interviewsToday}</p>
                                <p className="text-[#8F8F8F] text-sm">Generated Today</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-8 h-8 text-amber-600" />
                            <div>
                                <p className="text-2xl font-bold text-[#171717]">{metrics.averageScore}%</p>
                                <p className="text-[#8F8F8F] text-sm">Average Score</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#EBEBEB] rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold text-[#171717] text-sm truncate">{metrics.mostPopularRole}</p>
                                <p className="text-[#8F8F8F] text-sm">Popular Role</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">Questions</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#8F8F8F] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBEBEB]">
                                {filtered.map((interview) => (
                                    <tr key={interview.id} className="hover:bg-white">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-[#8F8F8F] mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-[#171717]">
                                                        {interview.user_name}
                                                    </div>
                                                    <div className="text-sm text-[#8F8F8F]">
                                                        {interview.user_email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Briefcase className="w-4 h-4 text-[#8F8F8F] mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-[#171717]">
                                                        {interview.role}
                                                    </div>
                                                    <div className="text-sm text-[#8F8F8F] capitalize">
                                                        {interview.interview_type} • {interview.experience_level}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4D4D4D]">
                                            {interview.num_questions}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${interview.final_score >= 80 ? 'bg-green-100 text-green-800' :
                                                interview.final_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {interview.final_score ? `${interview.final_score}%` : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4D4D4D]">
                                            {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => viewInterview(interview)}
                                                    className="text-indigo-600 hover:text-indigo-300 transition-colors"
                                                    title="View Interview"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteInterview(interview.id)}
                                                    className="text-red-600 hover:text-red-300 transition-colors"
                                                    title="Delete Interview"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Mic className="w-12 h-12 text-[#8F8F8F] mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-[#8F8F8F] mb-2">No interviews found</h3>
                            <p className="text-[#8F8F8F]">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            )}

            {/* Interview Detail Modal */}
            {showDetail && selectedInterview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FAFAFA] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-[#171717]">Interview Details</h2>
                                    <p className="text-[#8F8F8F] text-sm mt-1">
                                        {selectedInterview.user_name} • {selectedInterview.role} • {format(new Date(selectedInterview.created_at), 'PPP')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="text-[#8F8F8F] hover:text-[#171717] transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="space-y-6">
                                {selectedInterview.complete_prep ? (
                                    <div className="space-y-8">
                                        {/* Hiring Process */}
                                        <div className="bg-white/50 border border-slate-600 rounded-xl p-6">
                                            <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                                                <Building2 className="w-5 h-5" /> Hiring Process
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedInterview.complete_prep.hiring_process.map((round, idx) => (
                                                    <div key={idx} className="border-l-2 border-indigo-500 pl-4 py-1">
                                                        <h4 className="font-bold text-[#171717] text-sm">{round.round_name}</h4>
                                                        <p className="text-[#8F8F8F] text-xs mt-1">{round.details}</p>
                                                        <span className="text-[10px] text-indigo-300 font-bold uppercase mt-1 inline-block bg-indigo-50 px-2 py-0.5 rounded">
                                                            {round.expected_difficulty} Difficulty
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Roadmap */}
                                        <div className="bg-white/50 border border-slate-600 rounded-xl p-6">
                                            <h3 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
                                                <Target className="w-5 h-5" /> 4-Day Roadmap
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {selectedInterview.complete_prep.prep_roadmap.map((day, idx) => (
                                                    <div key={idx} className="bg-[#FAFAFA]/50 p-3 rounded-lg border border-slate-700">
                                                        <div className="text-emerald-500 text-[10px] font-bold uppercase mb-1">Day {day.day}</div>
                                                        <p className="text-[#171717] text-[11px] font-bold line-clamp-1">{day.topics[0]}</p>
                                                        <p className="text-[#8F8F8F] text-[10px] italic mt-1 line-clamp-2">{day.tasks[0]}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Questions with Answer Coach */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5" /> Top Questions & Coaching
                                            </h3>
                                            {selectedInterview.complete_prep.top_questions.map((q, qIdx) => (
                                                <div key={qIdx} className="bg-white/50 border border-slate-600 rounded-xl p-6">
                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                        <h4 className="text-[#171717] font-bold italic">&quot;{q.question}&quot;</h4>
                                                        <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase tracking-widest">
                                                            {q.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="mt-4 space-y-4">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8F8F8F] mb-2">Ideal Structure</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {q.answer_coach.ideal_structure.map((s, sIdx) => (
                                                                    <span key={sIdx} className="bg-white border border-[#EBEBEB] px-2 py-1 rounded text-[10px] text-[#4D4D4D]">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#8F8F8F] mb-2">Example Answer</p>
                                                            <p className="text-xs text-[#4D4D4D] leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                                                                {q.answer_coach.example_answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    selectedInterview.questions.map((question, index) => (
                                        <div key={index} className="bg-white/50 border border-slate-600 rounded-xl p-4">
                                            <h3 className="text-lg font-semibold text-[#171717] mb-3">
                                                Question {index + 1}
                                            </h3>
                                            <p className="text-[#171717] mb-4">{question}</p>

                                            {selectedInterview.answers && selectedInterview.answers[index] && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-[#4D4D4D] mb-2">User Answer:</h4>
                                                    <div className="bg-[#FAFAFA]/50 border border-slate-600 rounded-lg p-3">
                                                        <p className="text-[#171717] whitespace-pre-wrap">{selectedInterview.answers[index]}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedInterview.scores && selectedInterview.scores[index] && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 border border-blue-500/20 rounded-lg p-3">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {selectedInterview.scores[index].score}/10
                                                        </div>
                                                        <div className="text-sm text-blue-300">AI Score</div>
                                                    </div>
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                        <h4 className="text-sm font-medium text-green-300 mb-1">Feedback</h4>
                                                        <p className="text-sm text-green-200">{selectedInterview.scores[index].feedback}</p>
                                                    </div>
                                                    <div className="bg-amber-50 border border-yellow-500/20 rounded-lg p-3">
                                                        <h4 className="text-sm font-medium text-yellow-300 mb-1">Improvement Tips</h4>
                                                        <p className="text-sm text-yellow-200">{selectedInterview.scores[index].tips}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}

                                {selectedInterview.final_score && (
                                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                                        <div className="text-4xl font-bold text-[#171717] mb-2">{selectedInterview.final_score}%</div>
                                        <div className="text-[#4D4D4D]">Final Interview Score</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
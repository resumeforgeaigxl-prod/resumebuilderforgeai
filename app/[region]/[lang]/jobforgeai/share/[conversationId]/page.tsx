import { ShieldAlert, User as UserIcon, MessageSquare, ExternalLink } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface AIChat {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}

// Bypass RLS for shared viewing
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function SharedConversationPage({ params }: { params: { conversationId: string } }) {
    let messages: AIChat[] = [];
    let userName = 'Candidate';

    // 1. Fetch Conversation with admin client
    const { data: convo } = await supabaseAdmin
        .from('conversations')
        .select('user_id, users(display_name)')
        .eq('id', params.conversationId)
        .single();

    if (convo?.users) {
        const userObj = (Array.isArray(convo.users) ? convo.users[0] : convo.users) as { display_name?: string } | null;
        if (userObj?.display_name) {
            userName = userObj.display_name;
        }
    }

    // 2. Fetch Messages
    const { data: msgs } = await supabaseAdmin
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', params.conversationId)
        .order('created_at', { ascending: true });

    if (msgs) {
        messages = msgs as AIChat[];
    }

    return (
        <div className="min-h-screen bg-[#020205] text-white selection:bg-indigo-500/30">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#020205]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">AI Interview Insight</h1>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{userName}&apos;s Shared Session</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                    >
                        Try AI Yourself <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-12">
                {messages.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg">This conversation has no data or does not exist.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
                                    {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                    {msg.role === 'user' ? userName : 'JobForgeAI'}
                                </span>
                            </div>
                            <div className={`p-6 md:p-8 rounded-[2rem] text-sm md:text-base max-w-[90%] leading-relaxed shadow-2xl relative ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-none ring-1 ring-white/5'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}

                {/* Footer */}
                <div className="pt-20 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-sm">Shared via **ResumeForgeAI** — Build ATS-Proof Resumes with AI</p>
                </div>
            </main>
        </div>
    );
}

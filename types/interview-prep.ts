export type InterviewRoundType = 'Online Assessment' | 'Aptitude Test' | 'Technical Interview' | 'System Design' | 'HR Interview';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type QuestionSource = 'admin_seed' | 'user_submission';

export interface Company {
    id: string;
    name: string;
    industry?: string;
    logo_url?: string;
    created_at: string;
}

export interface Role {
    id: string;
    company_id: string;
    role_name: string;
    created_at: string;
}

export interface InterviewRound {
    id: string;
    role_id: string;
    round_type: InterviewRoundType;
}

export interface InterviewQuestion {
    id: string;
    round_id: string;
    question_text: string;
    difficulty: DifficultyType;
    frequency_score: number;
    verified: boolean;
    source: QuestionSource;
    created_at: string;
}

export interface InterviewSubmission {
    id: string;
    user_id: string;
    company_name: string;
    role_name: string;
    round_type: InterviewRoundType;
    question_text: string;
    difficulty: DifficultyType;
    notes?: string;
    status: SubmissionStatus;
    created_at: string;
}

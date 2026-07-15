export interface ProjectExpert {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  created_at?: string;
}

export interface ProjectRequest {
  id: string;
  project_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  college: string;
  university: string;
  branch: string;
  year: string;
  semester: string;
  project_type: 'Major' | 'Minor' | 'Mini';
  project_domain: string;
  project_title: string;
  project_description: string;
  existing_abstract?: string;
  requirements: string[];
  additional_requirements?: string;
  tech_frontend?: string;
  tech_backend?: string;
  tech_database?: string;
  tech_language?: string;
  tech_ai_framework?: string;
  tech_hosting?: string;
  submission_date?: string;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  budget_range: string;
  project_mode: 'Individual' | 'Team';
  team_size?: number;
  status: 'Pending' | 'Under Review' | 'In Progress' | 'Testing' | 'Completed' | 'Delivered' | 'Cancelled';
  expert_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFile {
  id: string;
  request_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by?: string;
  created_at?: string;
}

export interface ProjectTimelineEvent {
  id: string;
  request_id: string;
  title: string;
  description?: string;
  status: string;
  created_at?: string;
}

export interface ProjectMessage {
  id: string;
  request_id: string;
  sender_id?: string;
  sender_role: 'student' | 'admin' | 'expert';
  message: string;
  created_at?: string;
}

export interface ProjectDeliverable {
  id: string;
  request_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  version?: string;
  uploaded_by?: string;
  created_at?: string;
}

export interface ProjectInvoice {
  id: string;
  request_id: string;
  invoice_number: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'refunded';
  due_date?: string;
  payment_link?: string;
  created_at?: string;
}

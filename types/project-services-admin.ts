export interface ProjectQuotation {
  id: string;
  quotation_number: string;
  request_id: string;
  base_price: number;
  discount: number;
  additional_charges: number;
  tax: number;
  final_amount: number;
  currency: string;
  due_date?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectPayment {
  id: string;
  request_id: string;
  invoice_id?: string;
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  payment_method?: string;
  payment_date?: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectActivity {
  id: string;
  request_id: string;
  user_id?: string;
  action: string;
  description?: string;
  created_at?: string;
}

export interface ProjectSettings {
  id: string;
  key: string;
  value: any;
  updated_at?: string;
}

export interface ProjectExpertAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  skills: string[];
  domains: string[];
  availability: boolean;
  status: string;
  created_at?: string;
}

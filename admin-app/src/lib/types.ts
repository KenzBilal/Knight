// Knight Admin — TypeScript interfaces for all DB tables

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
}

export interface OrgConfig {
  id: string;
  org_id: string;
  company_name: string | null;
  company_website: string | null;
  services_offered: string[];
  tone: string;
  calendly_link: string | null;
  sniper_keywords: string[];
  sender_email: string;
  sender_domain: string | null;
  auto_send_threshold: number;
  daily_email_limit: number;
  telegram_enabled: boolean;
  telegram_phone: string | null;
  telegram_session: string | null;
  telegram_bot_token: string | null;
  telegram_admin_chat_id: string | null;
  telegram_mode: string | null;
  created_at: string;
}

export interface OrgApiKey {
  id: string;
  org_id: string;
  provider: string;
  key_encrypted: string;
  created_at: string;
}

export interface Job {
  id: string;
  org_id: string;
  type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'FAILED_PERMANENTLY';
  payload: Record<string, any>;
  result: Record<string, any> | null;
  error: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface Company {
  id: string;
  org_id: string;
  name: string;
  website_url: string | null;
  industry: string | null;
  lead_score: number;
  status: 'NEW' | 'AUDITED' | 'PITCHED' | 'REPLIED' | 'REJECTED' | 'CLOSED';
  ai_pitch: string | null;
  ai_suggestions: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  org_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  is_primary: boolean;
}

export interface Audit {
  id: string;
  org_id: string | null;
  company_id: string;
  status: string;
  total_score: number | null;
  created_at: string;
}

export interface AuditResult {
  id: string;
  audit_id: string;
  org_id: string | null;
  category: string;
  raw_data: Record<string, any>;
  issues_found: Record<string, any>;
}

export interface Email {
  id: string;
  org_id: string | null;
  company_id: string;
  direction: 'outbound' | 'inbound';
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  created_at: string;
}

export interface Draft {
  id: string;
  email_id: string;
  draft_text: string;
  status: 'pending' | 'approved' | 'sent' | 'rejected';
  created_at: string;
}

export interface TelegramLead {
  id: string;
  org_id: string;
  chat_id: number | null;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  location: string | null;
  website: string | null;
  source_group: string | null;
  category: string | null;
  status: string;
  ai_summary: string | null;
  chat_history: any[];
  pitch_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  org_id: string;
  type: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
}

export interface EngineControl {
  id: string;
  org_id: string;
  is_running: boolean;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  org_id: string;
  period_start: string;
  leads_searched: number;
  emails_sent: number;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  org_id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: Record<string, any>;
}

// Extended types with joins
export interface OrgWithConfig extends Org {
  org_config: OrgConfig | null;
  engine_control: EngineControl | null;
  member_count?: number;
}

export interface UserWithOrg extends AuthUser {
  org_name: string | null;
  org_id: string | null;
  role: string | null;
}

export interface CompanyWithContact extends Company {
  contacts: Contact[];
  org_name?: string;
}

export interface JobWithOrg extends Job {
  org_name?: string;
}

// Query result wrapper
export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

// Worker status
export interface WorkerStatus {
  pid: number | null;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  isRunning: boolean;
}

// Plan definition (from plans table in Supabase)
export interface Plan {
  id: string;
  name: string;
  price: number;                    // cents
  period: string;
  description: string | null;
  features: string[];
  lead_limit: number;               // -1 = unlimited
  email_limit: number;              // -1 = unlimited
  telegram_limit: number;           // -1 = unlimited
  lemon_product_id: string | null;
  lemon_variant_id: string | null;
  sort_order: number;
  highlighted: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

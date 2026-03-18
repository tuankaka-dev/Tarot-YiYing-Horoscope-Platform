// ============================================================
// TypeScript Interfaces for the I Ching Divination Application
// ============================================================

export type UserRole = 'user' | 'admin';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionType = 'premium_weekly' | 'credit_purchase' | 'daily_reset';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  is_banned: boolean;
  credits: number;
  is_premium: boolean;
  premium_until: Date | null;
  last_reset_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount_vnd: number;
  credits_change: number;
  status: TransactionStatus;
  type: TransactionType;
  payos_order_id: string | null;
  created_at: Date;
  // Joined relation
  profile?: Profile;
}

export interface Hexagram {
  id: number;
  name: string;
  chinese_name: string;
  meaning: string;
  image_url: string | null;
  trigram_above: string;
  trigram_below: string;
  description: string;
}

export interface ApiConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'custom';
  base_url: string;
  api_key: string;
  headers: Record<string, string> | null;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface UserHistory {
  id: string;
  user_id: string;
  question: string;
  main_hexagram_id: number;
  changing_hexagram_id: number | null;
  changing_lines: number[];
  ai_response: string;
  created_at: Date;
  // Joined relations
  main_hexagram?: Hexagram;
  changing_hexagram?: Hexagram | null;
  profile?: Profile;
}

// ============================================================
// Divination Logic Types
// ============================================================

export type CoinFace = 'heads' | 'tails';

/** 6 = Old Yin (changing), 7 = Young Yang, 8 = Young Yin, 9 = Old Yang (changing) */
export type LineValue = 6 | 7 | 8 | 9;

export type LineType = 'yin' | 'yang';

export interface CoinTossResult {
  coins: [CoinFace, CoinFace, CoinFace];
  value: LineValue;
  lineType: LineType;
  isChanging: boolean;
}

export interface DivinationResult {
  lines: CoinTossResult[];
  mainHexagramNumber: number;
  changingHexagramNumber: number | null;
  changingLinePositions: number[];
}

// ============================================================
// AI Integration Types
// ============================================================

export interface AIInterpretationRequest {
  mainHexagram: Hexagram;
  changingHexagram: Hexagram | null;
  changingLines: number[];
  question: string;
}

export interface AIInterpretationResponse {
  interpretation: string;
  error?: string;
}

// ============================================================
// API Route Types
// ============================================================

export interface DivinationAPIRequest {
  mainHexagramId: number;
  changingHexagramId: number | null;
  changingLines: number[];
  question: string;
}

export interface AdminUserUpdate {
  userId: string;
  role?: UserRole;
  is_banned?: boolean;
}

export interface ApiConfigCreate {
  name: string;
  provider: 'gemini' | 'openai' | 'custom';
  base_url: string;
  api_key: string;
  headers?: Record<string, string>;
  status: 'active' | 'inactive';
}

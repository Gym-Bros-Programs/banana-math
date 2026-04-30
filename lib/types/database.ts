export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Domain types ──────────────────────────────────────────────────────────

export type QuestionCategory = "arithmetic" | "algebra" | "trig"
export type QuestionSubType =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "decimal"
  | "fraction"
  | "exponent"
  | "linear"
  | "quadratic"

export type SessionMode = "timed" | "fixed"

export type OperatorPreset = "all" | "all_4" | "add_sub" | "mul_div" | "addition" | "subtraction" | "multiplication" | "division" | "custom"

// ─── Guest storage ─────────────────────────────────────────────────────────────

/** Max sessions stored in localStorage for guests before old ones are pruned */
export const GUEST_SESSION_LIMIT = 3

// ─── Row types ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string | null
  created_at: string
}

export interface Question {
  id: string
  category: QuestionCategory
  sub_type: QuestionSubType
  operand_a: number | null
  operand_b: number | null
  operator: string | null
  question_text: string
  correct_answer: string
  has_negatives: boolean
  difficulty: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string | null
  category: QuestionCategory
  operator_set: QuestionSubType[]
  allow_negatives: boolean
  session_mode: SessionMode
  duration_seconds: number | null
  question_limit: number | null
  correct_count: number
  total_count: number
  accuracy: number
  cqpm: number
  percentile: number | null
  is_leaderboard_eligible: boolean
  difficulty: string | null
  completed_at: string
}

export interface SessionAnswer {
  id: string
  session_id: string
  question_id: string
  user_answer: string
  is_correct: boolean
  time_taken_ms: number | null
  order_in_session: number
  answered_at: string
}

// ─── Joined types (for UI rendering) ───────────────────────────────────────

export interface SessionAnswerWithQuestion extends SessionAnswer {
  question: Question | null
}

export interface SessionWithAnswers extends Session {
  session_answers: SessionAnswerWithQuestion[]
}

// ─── Session config (what the user picks before starting) ──────────────────

export interface SessionConfig {
  category: QuestionCategory
  operatorSet: QuestionSubType[]
  allowNegatives: boolean
  sessionMode: SessionMode
  durationSeconds?: number   // for timed
  questionLimit?: number     // for fixed
}

// ─── Operator preset helpers ───────────────────────────────────────────────

export const OPERATOR_PRESETS: Record<OperatorPreset, QuestionSubType[]> = {
  all:            [], // represents "no filter" on operators
  all_4:          ["addition", "subtraction", "multiplication", "division"],
  add_sub:        ["addition", "subtraction"],
  mul_div:        ["multiplication", "division"],
  addition:       ["addition"],
  subtraction:    ["subtraction"],
  multiplication: ["multiplication"],
  division:       ["division"],
  custom:         [], // populated by user
}

export const PRESET_LABELS: Record<OperatorPreset, string> = {
  all:            "All Types",
  all_4:          "+ − × ÷",
  add_sub:        "+ and − only",
  mul_div:        "× and ÷ only",
  addition:       "Addition only",
  subtraction:    "Subtraction only",
  multiplication: "Multiplication only",
  division:       "Division only",
  custom:         "Custom",
}

/** These presets are leaderboard-eligible; custom combos or advanced types are not */
export const LEADERBOARD_PRESETS: OperatorPreset[] = [
  "all", "all_4", "add_sub", "mul_div", "addition", "subtraction", "multiplication", "division",
]

// ─── Supabase Database type (for typed client) ─────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at"> & { created_at?: string }
        Update: Partial<Omit<Profile, "id">>
        Relationships: []
      }
      questions: {
        Row: Question
        Insert: Omit<Question, "id" | "created_at"> & { id?: string; created_at?: string }
        Update: Partial<Omit<Question, "id">>
        Relationships: []
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, "id" | "completed_at"> & { id?: string; completed_at?: string }
        Update: Partial<Omit<Session, "id">>
        Relationships: []
      }
      session_answers: {
        Row: SessionAnswer
        Insert: Omit<SessionAnswer, "id" | "answered_at"> & { id?: string; answered_at?: string }
        Update: Partial<Omit<SessionAnswer, "id">>
        Relationships: [
          {
            foreignKeyName: "session_answers_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_questions_for_session: {
        Args: {
          p_category: string
          p_operator_set: string[]
          p_allow_negatives: boolean
          p_limit: number
          p_difficulty?: string
        }
        Returns: Question[]
      }
      calculate_session_percentile: {
        Args: { p_session_id: string }
        Returns: number
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

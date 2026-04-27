import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"
import os from "os"

import { DEFAULT_MOCK_SESSIONS } from "./mock-data"

/**
 * Dev modes (controlled by .env.local flags):
 *
 *  Mode 1 — UI only (NEXT_PUBLIC_MOCK_DB=true)
 *    No DB, no auth. Questions generated locally. Session saves silently no-op.
 *    Use: testing UI layout and game flow without any backend.
 *
 *  Mode 2 — Fake auth (NEXT_PUBLIC_MOCK_AUTH=true, real or no DB)
 *    Auth returns a mock user. DB calls go through normally (or fall back if also mocked).
 *    Use: testing auth-gated pages without going through login.
 *
 *  Mode 3 — Full local (real SUPABASE_URL + ANON_KEY, no mock flags)
 *    Real Supabase project, real auth. Runs against the actual cloud DB locally.
 *    Use: integration testing the full flow before deploying.
 *
 *  Mode 4 — Production (deployed, same as mode 3 but in Vercel/hosting env)
 */

export const createClient = () => {
  const MOCK_DB   = process.env.NEXT_PUBLIC_MOCK_DB   === "true"
  const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"
  const HAS_DB    = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const cookieStore = cookies()

  const isMockSessionActive = () => {
    try {
      const cookieVal = cookieStore.get("mock_session_active")?.value
      if (cookieVal === "false") return false
      if (cookieVal === "true") return true
    } catch {}
    return MOCK_AUTH
  }

  const mockUser = { id: "mock-user-id", email: "dev@local.test" }

  // ── Mode 1 or 2 mock DB: no real Supabase client at all ──────────────────────
  if (MOCK_DB || !HAS_DB) {
    const MOCK_DB_FILE = path.join(os.tmpdir(), "banana_math_mock_db.json")

    let mockSessions = [...DEFAULT_MOCK_SESSIONS]
    try {
      if (fs.existsSync(MOCK_DB_FILE)) {
        const fileData = fs.readFileSync(MOCK_DB_FILE, "utf-8")
        const parsed = JSON.parse(fileData)
        if (Array.isArray(parsed) && parsed.length >= 5 && !parsed.some((s: any) => typeof s.accuracy !== "number")) {
          mockSessions = parsed
        } else {
          fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(mockSessions))
        }
      } else {
        fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(mockSessions))
      }
    } catch (e) {
      // fallback to memory if fs fails
    }

    const mockQueryBuilder: any = {
      _lastInserted: null,
      _context: "leaderboard", // default unless 'eq' changes it
      _modeFilter: null,
      _diffFilter: null,
      _timeframe: null,
      _durationFilter: null,
      _questionsFilter: null,
      _operatorFilter: null,

      select:  () => mockQueryBuilder,
      limit:   () => mockQueryBuilder,
      update:  () => mockQueryBuilder,
      upsert:  () => mockQueryBuilder,
      range:   () => mockQueryBuilder,

      insert: (data: any) => {
        return mockQueryBuilder
      },

      eq: (col: string, val: any) => {
        if (col === "user_id") mockQueryBuilder._context = "sessions"
        if (col === "session_mode") mockQueryBuilder._modeFilter = val
        if (col === "difficulty") mockQueryBuilder._diffFilter = val
        if (col === "timeframe") mockQueryBuilder._timeframe = val
        if (col === "duration_seconds") mockQueryBuilder._durationFilter = val
        if (col === "question_limit") mockQueryBuilder._questionsFilter = val
        if (col === "operator_set") mockQueryBuilder._operatorFilter = val
        return mockQueryBuilder
      },

      order: () => mockQueryBuilder,

      single: async () => ({ data: { id: "mock-session-id" }, error: null }),
      
      then: (resolve: any) => {
        if (mockQueryBuilder._context === "sessions") {
          resolve({ data: mockSessions, error: null })
        } else {
          // ── Leaderboard Logic ──
          const now = new Date()
          const timeframe = mockQueryBuilder._timeframe || "all"
          const mode = mockQueryBuilder._modeFilter
          const diff = mockQueryBuilder._diffFilter
          const duration = mockQueryBuilder._durationFilter
          const questions = mockQueryBuilder._questionsFilter
          const operators = mockQueryBuilder._operatorFilter

          let filtered = mockSessions.filter((s: any) => {
            if (s.accuracy === 0) return false
            if (mode && s.session_mode !== mode) return false
            if (diff && s.difficulty !== diff) return false
            if (duration && String(s.duration_seconds) !== String(duration)) return false
            if (questions && String(s.question_limit) !== String(questions)) return false
            
            if (operators && Array.isArray(operators)) {
              const sOps = [...(s.operator_set || [])].sort().join(",")
              const qOps = [...operators].sort().join(",")
              if (sOps !== qOps) return false
            }

            const date = new Date(s.completed_at)
            if (timeframe === "weekly") {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              if (date < weekAgo) return false
            } else if (timeframe === "monthly") {
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
              if (date < monthAgo) return false
            } else if (timeframe === "yearly") {
              const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
              if (date < yearAgo) return false
            }
            return true
          })

          // Deduplicate: Keep only the highest score per user for this category combo
          const uniqueEntries = new Map<string, any>()
          filtered.forEach((s: any) => {
            const opsKey = [...(s.operator_set || [])].sort().join(",")
            const key = `${s.user_id}-${s.session_mode}-${s.difficulty}-${opsKey}`
            const existing = uniqueEntries.get(key)
            if (!existing || s._primaryScore > existing._primaryScore) {
              uniqueEntries.set(key, {
                user_email: s.user_id === "mock-user-id" ? "you@local.test" : "guest@numerify.me",
                percentage: s._primaryScore,
                created_at: s.completed_at,
                _primaryScore: s._primaryScore,
                user_id: s.user_id
              })
            }
          })

          const baseLeaderboard = [
            { user_email: "expert@math.ninja", percentage: 100, created_at: new Date(Date.now() - 3600000).toISOString(), _primaryScore: 100 },
            { user_email: "demo@local.test", percentage: 95, created_at: new Date(Date.now() - 7200000).toISOString(), _primaryScore: 95 },
          ]

          const combined = [...baseLeaderboard, ...Array.from(uniqueEntries.values())]
          combined.sort((a, b) => b._primaryScore - a._primaryScore)

          resolve({ data: combined, error: null })
        }
      }
    }
    return {
      auth: {
        getUser: async () => ({
          data: { user: isMockSessionActive() ? mockUser : null },
          error: null,
        }),
        signOut: async () => {
          try { cookieStore.set("mock_session_active", "false") } catch {}
          return { error: null }
        },
        signInWithPassword: async ({ email, password }: any) => {
          if ((email !== "a@a.a" && email !== "a") || password !== "123456") {
            return { data: null, error: { message: "Invalid login credentials (use a@a.a or 'a' / 123456)" } }
          }
          try { cookieStore.set("mock_session_active", "true") } catch {}
          return { data: { user: mockUser }, error: null }
        },
        signUp: async () => {
          try { cookieStore.set("mock_session_active", "true") } catch {}
          return { data: { user: mockUser }, error: null }
        }
      },
      from:  () => mockQueryBuilder,
      // rpc returns error → game-actions falls back to local generator
      rpc:   async () => ({ data: null, error: { message: "DB unavailable (mock mode)" } }),
    } as any
  }

  // ── Mode 2 fake auth only: real DB client but override getUser ────────────────
  const realClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: "", ...options }) } catch {}
        },
      },
    }
  )

  if (MOCK_AUTH) {
    realClient.auth.getUser = async () => ({
      data: { user: isMockSessionActive() ? mockUser : null },
      error: null,
    }) as any
    realClient.auth.signOut = async () => {
      try { cookieStore.set("mock_session_active", "false") } catch {}
      return { error: null }
    }
    realClient.auth.signInWithPassword = async ({ email, password }: any) => {
      if ((email !== "a@a.a" && email !== "a") || password !== "123456") {
        return { data: null, error: { message: "Invalid login credentials (use a@a.a or 'a' / 123456)" } } as any
      }
      try { cookieStore.set("mock_session_active", "true") } catch {}
      return { data: { user: mockUser }, error: null } as any
    }
    realClient.auth.signUp = async () => {
      try { cookieStore.set("mock_session_active", "true") } catch {}
      return { data: { user: mockUser }, error: null } as any
    }
    return realClient
  }

  // ── Mode 3 / 4: real client, real auth ───────────────────────────────────────
  return realClient
}

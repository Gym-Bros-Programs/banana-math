import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

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

const MOCK_DB   = process.env.NEXT_PUBLIC_MOCK_DB   === "true"
const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"
const HAS_DB    = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = () => {
  const cookieStore = cookies()

  // ── Mode 1 or 2 mock DB: no real Supabase client at all ──────────────────────
  if (MOCK_DB || !HAS_DB) {
    const mockQueryBuilder: any = {
      select:  () => mockQueryBuilder,
      eq:      () => mockQueryBuilder,
      limit:   () => mockQueryBuilder,
      insert:  () => mockQueryBuilder,
      update:  () => mockQueryBuilder,
      upsert:  () => mockQueryBuilder,
      order:   async () => ({ data: [], error: null }),
      single:  async () => ({ data: { id: "mock-session-id" }, error: null }),
    }
    return {
      auth: {
        getUser: async () => ({
          data: { user: MOCK_AUTH ? { id: "mock-user-id", email: "dev@local.test" } : null },
          error: null,
        }),
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
    return {
      ...realClient,
      auth: {
        ...realClient.auth,
        getUser: async () => ({
          data: { user: { id: "mock-user-id", email: "dev@local.test" } },
          error: null,
        }),
      },
    } as any
  }

  // ── Mode 3 / 4: real client, real auth ───────────────────────────────────────
  return realClient
}

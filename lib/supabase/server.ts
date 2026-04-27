import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createClient = () => {
  const cookieStore = cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const mockQueryBuilder = {
      select: () => mockQueryBuilder,
      range: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      order: async () => ({
        data: [
          { user_email: "demo@numerify.me", percentage: 95, created_at: new Date().toISOString() },
          { user_email: "guest@numerify.me", percentage: 82, created_at: new Date().toISOString() }
        ],
        error: null
      }),
      single: async () => ({ data: { id: "mock-attempt-id", full_name: "Demo User" }, error: null })
    };
    return {
      auth: {
        getUser: async () => ({ data: { user: { id: "mock-id", email: "demo@numerify.me" } }, error: null })
      },
      from: () => mockQueryBuilder
    } as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (_error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (_error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  )
}

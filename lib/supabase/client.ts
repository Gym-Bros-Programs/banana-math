import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {

    const mockQueryBuilder = {
      select: () => mockQueryBuilder,
      range: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      order: async () => ({ data: [], error: null }),
      single: async () => ({ data: { full_name: "Demo User" }, error: null }),
      insert: () => mockQueryBuilder
    };
    return {
      auth: {
        getUser: async () => ({ data: { user: { id: "mock-id", email: "demo@numerify.me" } }, error: null })
      },
      from: () => mockQueryBuilder
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

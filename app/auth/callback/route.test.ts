import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "./route"

const mocks = vi.hoisted(() => {
  const supabase = {
    auth: {
      exchangeCodeForSession: vi.fn(),
      getUser: vi.fn()
    }
  }

  return {
    supabase,
    createClient: vi.fn(() => supabase)
  }
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient
}))

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    mocks.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", user_metadata: { username: "banana_champ" } } }
    })
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it("redirects to a valid configured site URL after callback", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.numerify.me"

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=auth-code", {
        headers: { host: "localhost:3000" }
      })
    )

    expect(response.headers.get("location")).toBe("https://www.numerify.me/")
  })

  it("falls back to the request origin when the configured site URL is malformed", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "www.Numerify.me"

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=auth-code", {
        headers: { host: "localhost:3000" }
      })
    )

    expect(response.headers.get("location")).toBe("http://localhost:3000/")
  })
})

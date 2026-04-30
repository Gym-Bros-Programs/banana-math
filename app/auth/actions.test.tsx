import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestPasswordReset, signInWithGoogle, signUp, updatePassword } from "./actions"

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  })

  const headers = vi.fn(() => ({
    get: vi.fn((name: string) => (name === "origin" ? "http://localhost:3000" : null))
  }))

  const supabase = {
    auth: {
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      updateUser: vi.fn()
    },
    from: vi.fn()
  }

  return {
    redirect,
    headers,
    supabase,
    createClient: vi.fn(() => supabase)
  }
})

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}))

vi.mock("next/headers", () => ({
  headers: mocks.headers
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient
}))

vi.mock("@/lib/profanity", () => ({
  isProfane: vi.fn(() => false)
}))

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    mocks.supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/v2/auth" },
      error: null
    })
    mocks.supabase.auth.signUp.mockResolvedValue({ error: null })
    mocks.supabase.auth.updateUser.mockResolvedValue({ error: null })
    mocks.supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      }))
    })
    delete process.env.NEXT_PUBLIC_DISABLE_GOOGLE_AUTH
    delete process.env.NEXT_PUBLIC_MOCK_AUTH
    delete process.env.NEXT_PUBLIC_MOCK_DB
  })

  it("sends password reset email through the auth callback recovery flow", async () => {
    const formData = new FormData()
    formData.set("email", "player@example.com")

    await expect(requestPasswordReset(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/login?message=Check your email for a password reset link."
    )

    expect(mocks.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("player@example.com", {
      redirectTo: "http://localhost:3000/auth/callback?next=/auth/reset-password"
    })
  })

  it("updates the password for a recovery session", async () => {
    const formData = new FormData()
    formData.set("password", "NewPass123!")

    await expect(updatePassword(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/login?message=Password updated. Please sign in."
    )

    expect(mocks.supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "NewPass123!"
    })
  })

  it("blocks Google auth when local dev mode disables it", async () => {
    process.env.NEXT_PUBLIC_DISABLE_GOOGLE_AUTH = "true"

    await expect(signInWithGoogle()).rejects.toThrow(
      "NEXT_REDIRECT:/login?message=Google Sign In is not available during local testing."
    )

    expect(mocks.supabase.auth.signInWithOAuth).not.toHaveBeenCalled()
  })

  it("shows an error when signup username is already taken", async () => {
    mocks.supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: "user-1" }, error: null })
        }))
      }))
    })

    const formData = new FormData()
    formData.set("username", "banana_champ")
    formData.set("email", "player@example.com")
    formData.set("password", "NewPass123!")

    await expect(signUp(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/login?message=Username is already taken."
    )

    expect(mocks.supabase.auth.signUp).not.toHaveBeenCalled()
  })
})

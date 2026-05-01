import { beforeEach, describe, expect, it, vi } from "vitest"

import { completeGoogleUsernameSetup } from "./actions"

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  })

  const maybeSingle = vi.fn()
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const profileUpdateEq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn(() => ({ eq: profileUpdateEq }))
  const upsert = vi.fn().mockResolvedValue({ error: null })

  const supabase = {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn()
    },
    from: vi.fn(() => ({
      select,
      update,
      upsert
    }))
  }

  return {
    redirect,
    maybeSingle,
    profileUpdateEq,
    supabase,
    createClient: vi.fn(() => supabase)
  }
})

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient
}))

vi.mock("@/lib/profanity", () => ({
  isProfane: vi.fn(() => false)
}))

describe("completeGoogleUsernameSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "player@example.com" } }
    })
    mocks.supabase.auth.updateUser.mockResolvedValue({ error: null })
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null })
  })

  it("saves unique username to profile and user metadata", async () => {
    const formData = new FormData()
    formData.set("username", "banana_champ")
    formData.set("password", "NewPass123!")

    await expect(completeGoogleUsernameSetup(formData)).rejects.toThrow("NEXT_REDIRECT:/")

    expect(mocks.supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "NewPass123!",
      data: { username: "banana_champ" }
    })
  })

  it("requires a strong password before saving username", async () => {
    const formData = new FormData()
    formData.set("username", "banana_champ")
    formData.set("password", "weakpass")

    await expect(completeGoogleUsernameSetup(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/auth/setup-username?message=Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    )

    expect(mocks.supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it("shows an error when username is already taken", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "other-user" }, error: null })
    const formData = new FormData()
    formData.set("username", "banana_champ")
    formData.set("password", "NewPass123!")

    await expect(completeGoogleUsernameSetup(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/auth/setup-username?message=Username is already taken."
    )
  })
})

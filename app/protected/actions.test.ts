import { beforeEach, describe, expect, it, vi } from "vitest"

import { updateDisplayName, updateProfilePassword } from "./actions"

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  })

  const profileUpdate = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ error: null })
  }))

  const supabase = {
    auth: {
      getUser: vi.fn(),
      updateUser: vi.fn()
    },
    from: vi.fn(() => ({
      update: profileUpdate
    }))
  }

  return {
    redirect,
    profileUpdate,
    supabase,
    createClient: vi.fn(() => supabase)
  }
})

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient
}))

describe("profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "player@example.com" } }
    })
    mocks.supabase.auth.updateUser.mockResolvedValue({ error: null })
  })

  it("updates display name without changing username", async () => {
    const formData = new FormData()
    formData.set("display_name", "Banana Champ")

    await expect(updateDisplayName(formData)).rejects.toThrow("NEXT_REDIRECT:/protected")

    expect(mocks.profileUpdate).toHaveBeenCalledWith({ display_name: "Banana Champ" })
  })

  it("updates password from profile page", async () => {
    const formData = new FormData()
    formData.set("password", "NewPass123!")

    await expect(updateProfilePassword(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/protected?message=Password updated."
    )

    expect(mocks.supabase.auth.updateUser).toHaveBeenCalledWith({ password: "NewPass123!" })
  })
})

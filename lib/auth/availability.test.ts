import { beforeEach, describe, expect, it, vi } from "vitest"

import { checkAuthAvailability } from "./availability"

const mocks = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const listUsers = vi.fn()

  const client = {
    auth: {
      admin: {
        listUsers
      }
    },
    from: vi.fn(() => ({ select }))
  }

  return {
    maybeSingle,
    listUsers,
    createClient: vi.fn(() => client)
  }
})

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient
}))

describe("checkAuthAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co"
    process.env.SUPABASE_SERVICE_KEY = "service-key"
    delete process.env.SUPABASE_SERVICE_KEY_PROD
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null })
    mocks.listUsers.mockResolvedValue({ data: { users: [] }, error: null })
  })

  it("reports username and email as unavailable when they already exist", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { id: "user-1" }, error: null })
    mocks.listUsers.mockResolvedValue({
      data: { users: [{ email: "player@example.com" }] },
      error: null
    })

    await expect(
      checkAuthAvailability({ username: "banana_champ", email: "PLAYER@example.com" })
    ).resolves.toEqual({
      username: { available: false },
      email: { available: false }
    })
  })

  it("uses the production service key when checking the cloud Supabase URL", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://cloud.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_CLOUD_URL = "https://cloud.supabase.co"
    process.env.SUPABASE_SERVICE_KEY = "local-service-key"
    process.env.SUPABASE_SERVICE_KEY_PROD = "prod-service-key"

    await checkAuthAvailability({ email: "player@example.com" })

    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://cloud.supabase.co",
      "prod-service-key",
      expect.any(Object)
    )
  })
})

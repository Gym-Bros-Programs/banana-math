import { describe, it, expect, vi, beforeEach } from "vitest"
import { getQuestionsForSession, createSession, getUserSessions } from "./game-actions"

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}))

// Mock next/headers (for cookies)
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn()
  }))
}))

describe("Game Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset process.env for each test
    process.env.NEXT_PUBLIC_MOCK_DB = "true"
    process.env.NEXT_PUBLIC_MOCK_AUTH = "true"
    // Clear the global mockSessions
    ;(global as any).mockSessions = undefined
  })

  it("getQuestionsForSession returns stable mock questions if DB is mocked", async () => {
    const config: any = { category: "arithmetic", operatorSet: ["addition"], sessionMode: "timed" }
    const questions = await getQuestionsForSession(config)

    expect(questions[0].id).toBe("mock-q-0")
    expect(questions[0].question_text).toBe("1 + 1 = ?")
  })

  it("createSession adds a session to the mock list in MOCK_DB mode", async () => {
    const config: any = { category: "arithmetic", operatorSet: ["addition"], sessionMode: "timed" }
    const sessionId = await createSession(config, 10, 10, 60)

    expect(sessionId).toContain("mock-")

    const sessions = await getUserSessions()
    const session = sessions.find((s: any) => s.id === sessionId)
    expect(session).toBeDefined()
    expect(session.correct_count).toBe(10)
  })

  it("getUserSessions returns mock data when not logged in and no mock auth", async () => {
    process.env.NEXT_PUBLIC_MOCK_AUTH = "false"
    const sessions = await getUserSessions()
    expect(sessions[0].id).toBe("mock-1") // The hardcoded mock sessions
  })
})

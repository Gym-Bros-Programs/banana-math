import { describe, expect, it } from "vitest"

import { getBestLeaderboardEntries, type LeaderboardEntry } from "./leaderboard"

function entry(overrides: Partial<LeaderboardEntry>): LeaderboardEntry {
  return {
    id: overrides.id ?? "session-id",
    user_id: overrides.user_id ?? "user-1",
    category: "arithmetic",
    operator_set: overrides.operator_set ?? ["addition"],
    allow_negatives: false,
    session_mode: overrides.session_mode ?? "timed",
    duration_seconds: overrides.duration_seconds ?? 60,
    question_limit: overrides.question_limit ?? null,
    correct_count: overrides.correct_count ?? 10,
    total_count: overrides.total_count ?? 10,
    accuracy: overrides.accuracy ?? 100,
    cqpm: overrides.cqpm ?? 10,
    percentile: null,
    is_leaderboard_eligible: true,
    difficulty: overrides.difficulty ?? "Easy",
    completed_at: overrides.completed_at ?? "2026-01-01T00:00:00.000Z",
    ...overrides
  }
}

describe("getBestLeaderboardEntries — edge cases", () => {
  it("returns empty array for empty input", () => {
    expect(getBestLeaderboardEntries([])).toEqual([])
  })

  it("returns single entry unchanged", () => {
    const result = getBestLeaderboardEntries([entry({ id: "only" })])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("only")
  })

  it("separates entries by difficulty", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "easy", difficulty: "Easy", cqpm: 30 }),
      entry({ id: "hard", difficulty: "Hard", cqpm: 25 })
    ])
    expect(result.map((e) => e.id)).toContain("easy")
    expect(result.map((e) => e.id)).toContain("hard")
  })

  it("separates entries by operator set regardless of order", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "add-only", operator_set: ["addition"], cqpm: 20 }),
      entry({ id: "add-sub", operator_set: ["addition", "subtraction"], cqpm: 15 })
    ])
    expect(result).toHaveLength(2)
  })

  it("separates entries by user", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "u1", user_id: "user-1", cqpm: 30 }),
      entry({ id: "u2", user_id: "user-2", cqpm: 20 })
    ])
    expect(result).toHaveLength(2)
  })

  it("sorts result by cqpm descending", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "slow", user_id: "user-1", cqpm: 10 }),
      entry({ id: "fast", user_id: "user-2", cqpm: 40 }),
      entry({ id: "mid", user_id: "user-3", cqpm: 25 })
    ])
    expect(result.map((e) => e.id)).toEqual(["fast", "mid", "slow"])
  })

  it("handles null cqpm as 0", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "null-cqpm", user_id: "user-1", cqpm: null as any }),
      entry({ id: "real-cqpm", user_id: "user-2", cqpm: 5 })
    ])
    expect(result[0].id).toBe("real-cqpm")
  })

  it("guest entries keyed by user_email when user_id is null", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "guest-slow", user_id: null as any, user_email: "a@b.com", cqpm: 10 }),
      entry({ id: "guest-fast", user_id: null as any, user_email: "a@b.com", cqpm: 30 })
    ])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("guest-fast")
  })
})

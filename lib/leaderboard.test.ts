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
    completed_at: overrides.completed_at ?? "2026-01-01T00:00:00.000Z"
  }
}

describe("getBestLeaderboardEntries", () => {
  it("keeps only the highest QPM per user, operators, difficulty, mode, and timed length", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "slow-60", cqpm: 20, duration_seconds: 60 }),
      entry({ id: "fast-60", cqpm: 30, duration_seconds: 60 }),
      entry({ id: "fast-120", cqpm: 25, duration_seconds: 120 })
    ])

    expect(result.map((session) => session.id)).toEqual(["fast-60", "fast-120"])
  })

  it("keeps fixed sessions separate by question limit", () => {
    const result = getBestLeaderboardEntries([
      entry({
        id: "ten-questions",
        session_mode: "fixed",
        duration_seconds: 45,
        question_limit: 10,
        cqpm: 50
      }),
      entry({
        id: "twenty-five-questions",
        session_mode: "fixed",
        duration_seconds: 90,
        question_limit: 25,
        cqpm: 45
      })
    ])

    expect(result.map((session) => session.id)).toEqual(["ten-questions", "twenty-five-questions"])
  })

  it("uses accuracy then completed date as tie breakers", () => {
    const result = getBestLeaderboardEntries([
      entry({ id: "lower-accuracy", cqpm: 30, accuracy: 90 }),
      entry({ id: "older", cqpm: 30, accuracy: 95, completed_at: "2026-01-01T00:00:00.000Z" }),
      entry({ id: "newer", cqpm: 30, accuracy: 95, completed_at: "2026-01-02T00:00:00.000Z" })
    ])

    expect(result.map((session) => session.id)).toEqual(["newer"])
  })
})

import type { Session } from "@/lib/types/database"

export type LeaderboardEntry = Session & {
  user_email?: string | null
}

export function getBestLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const bestEntries = new Map<string, LeaderboardEntry>()

  for (const entry of entries) {
    const key = getLeaderboardKey(entry)
    const currentBest = bestEntries.get(key)

    if (!currentBest || compareLeaderboardEntries(entry, currentBest) < 0) {
      bestEntries.set(key, entry)
    }
  }

  return [...bestEntries.values()].sort(compareLeaderboardEntries)
}

function getLeaderboardKey(entry: LeaderboardEntry): string {
  const operators = [...(entry.operator_set ?? [])].sort().join(",")
  const modeLength =
    entry.session_mode === "timed"
      ? `duration:${entry.duration_seconds ?? ""}`
      : `questions:${entry.question_limit ?? ""}`

  return [
    entry.user_id ?? entry.user_email ?? "guest",
    operators,
    entry.difficulty ?? "",
    entry.session_mode,
    modeLength
  ].join("|")
}

function compareLeaderboardEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  const scoreDiff = Number(b.cqpm ?? 0) - Number(a.cqpm ?? 0)
  if (scoreDiff !== 0) return scoreDiff

  const accuracyDiff = Number(b.accuracy ?? 0) - Number(a.accuracy ?? 0)
  if (accuracyDiff !== 0) return accuracyDiff

  return new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
}

import { redirect } from "next/navigation"

import type { FilterOption } from "@/components/FilterBar"
import FilterBar from "@/components/FilterBar"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { createClient } from "@/lib/supabase/server"
import { getBestLeaderboardEntries } from "@/lib/leaderboard"
import { OPERATOR_PRESETS } from "@/lib/types/database"
import { formatOperatorSet, formatDate } from "@/lib/formatters"

export default async function AttemptHistory({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createClient()
  const modeFilter = searchParams.mode
  const diffFilter = searchParams.difficulty
  const durationFilter = searchParams.duration
  const questionsFilter = searchParams.questions
  const operatorFilter = searchParams.operators || "all"

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"
  if (!user && !authError && !isMockAuth) {
    return redirect("/login")
  }

  const timeframeFilter = searchParams.timeframe

  let query = supabase
    .from("sessions")
    .select("*")
    .eq("is_leaderboard_eligible", true)
    .order("cqpm", { ascending: false })

  if (modeFilter && modeFilter !== "all") query = query.eq("session_mode", modeFilter)
  if (diffFilter && diffFilter !== "all") query = query.eq("difficulty", diffFilter)
  if (durationFilter && durationFilter !== "all")
    query = query.eq("duration_seconds", durationFilter)
  if (questionsFilter && questionsFilter !== "all")
    query = query.eq("question_limit", questionsFilter)
  if (timeframeFilter && timeframeFilter !== "all") {
    const now = new Date()
    const since = new Date(now)
    if (timeframeFilter === "weekly") since.setDate(now.getDate() - 7)
    if (timeframeFilter === "monthly") since.setMonth(now.getMonth() - 1)
    if (timeframeFilter === "yearly") since.setFullYear(now.getFullYear() - 1)
    query = query.gte("completed_at", since.toISOString())
  }

  if (operatorFilter && operatorFilter !== "all") {
    const ops = OPERATOR_PRESETS[operatorFilter as keyof typeof OPERATOR_PRESETS]
    if (ops && ops.length > 0) {
      query = query.contains("operator_set", [...ops].sort())
    }
  }

  let { data: leaderboard, error } = await query

  if (error) {
    console.error("❌ Leaderboard query error:", error.message, error.details)
    leaderboard = []
  }
  if (!leaderboard) leaderboard = []

  console.log(`📋 Leaderboard: ${leaderboard.length} entries (filter: ${operatorFilter})`)

  // Fetch display names for all user_ids in the leaderboard
  const typedLeaderboard = leaderboard as LeaderboardEntry[]
  const userIds = Array.from(
    new Set(typedLeaderboard.map((entry) => entry.user_id).filter(Boolean))
  )
  const profileMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", userIds)
    if (profiles) {
      profiles.forEach(
        (p: { id: string; username?: string | null; display_name?: string | null }) => {
          profileMap[p.id] = p.display_name || p.username || "Unknown"
        }
      )
    }
  }

  const dedupedLeaderboard = getBestLeaderboardEntries(typedLeaderboard)

  // Find user's best entry and rank
  const userEntry = dedupedLeaderboard.find((e) => e.user_id === user?.id)
  const userRank = userEntry ? dedupedLeaderboard.indexOf(userEntry) + 1 : null
  const topN = dedupedLeaderboard.slice(0, 50)

  const filterOptions: FilterOption[] = [
    {
      label: "Timeframe",
      key: "timeframe",
      values: [
        { label: "All Time", value: "all" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" }
      ]
    },
    {
      label: "Mode",
      key: "mode",
      values: [
        { label: "All", value: "all" },
        { label: "Timed", value: "timed" },
        { label: "Question Based", value: "fixed" }
      ]
    },
    {
      label: "Difficulty",
      key: "difficulty",
      values: [
        { label: "All", value: "all" },
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" }
      ]
    },
    {
      label: "Type",
      key: "operators",
      type: "dropdown",
      values: [
        { label: "All Types", value: "all" },
        { label: "+ − × ÷", value: "all_4" },
        { label: "+ −", value: "add_sub" },
        { label: "× ÷", value: "mul_div" },
        { label: "+ only", value: "addition" },
        { label: "− only", value: "subtraction" },
        { label: "× only", value: "multiplication" },
        { label: "÷ only", value: "division" }
      ]
    }
  ]

  if (modeFilter === "timed") {
    filterOptions.push({
      label: "Length",
      key: "duration",
      values: [
        { label: "All", value: "all" },
        { label: "15s", value: "15" },
        { label: "30s", value: "30" },
        { label: "60s", value: "60" },
        { label: "120s", value: "120" }
      ]
    })
  } else if (modeFilter === "fixed") {
    filterOptions.push({
      label: "Length",
      key: "questions",
      values: [
        { label: "All", value: "all" },
        { label: "10Q", value: "10" },
        { label: "25Q", value: "25" },
        { label: "50Q", value: "50" },
        { label: "100Q", value: "100" }
      ]
    })
  }

  return (
    <div
      className="w-full flex flex-col pt-10 pb-4 font-['Inter'] relative overflow-hidden"
      style={{ height: "calc(100vh - 115px)" }}
    >
      <div className="w-full shrink-0">
        <div className="border-b border-[#2C2920] pb-4 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(50,100%,52%)]">
            Leaderboard
          </h1>
          <p className="text-[#C8BCAD] mt-1 text-sm">Global ranking by score (Top 50)</p>
        </div>

        <FilterBar options={filterOptions} currentParams={searchParams} />
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-[#2C2920] bg-[#17150F] scrollbar-thin scrollbar-thumb-[#2C2920] scrollbar-track-transparent mt-4 mb-24 relative">
        <table className="min-w-full relative">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 border-b border-r border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-6 py-4 border-b border-[#2C2920] bg-[#211E17] text-center text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2920]">
            {topN?.map((entry, index) => {
              const isUser = entry.user_id === user?.id || entry.user_email === "you@local.test"
              return (
                <tr
                  key={index}
                  className={`hover:bg-[#211E17] transition-colors ${isUser ? "bg-[#211E17]/50" : ""}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD] border-r border-[#2C2920] text-center">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-[#EDE6DA] border-r border-[#2C2920] text-center">
                    {entry.user_id ? profileMap[entry.user_id] || "Unknown" : "Guest"}{" "}
                    {isUser && "(You)"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C8BCAD] border-r border-[#2C2920] text-center">
                    {formatOperatorSet(entry.operator_set)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold border-r border-[#2C2920] text-center">
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        entry.difficulty === "Hard"
                          ? "border-red-500/30 text-red-400 bg-red-500/5"
                          : entry.difficulty === "Medium"
                            ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                            : "border-[hsl(50,100%,52%)]/30 text-[hsl(50,100%,52%)] bg-[hsl(50,100%,52%)]/5"
                      }`}
                    >
                      {entry.difficulty?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-[hsl(50,100%,52%)] border-r border-[#2C2920] text-center">
                    {entry.cqpm ?? 0} QPM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-black text-lg text-[#EDE6DA] border-r border-[#2C2920] text-center">
                    {entry.accuracy ?? 0}%
                  </td>
                  <td
                    suppressHydrationWarning
                    className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD] text-center"
                  >
                    {entry.completed_at ? formatDate(entry.completed_at) : "N/A"}
                  </td>
                </tr>
              )
            })}
            {topN.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#C8BCAD]">
                  No entries found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky Personal Rank */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#17150F] border-t border-[#2C2920] px-20 py-6 flex items-center justify-between z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold">
              Your Rank
            </span>
            <span className="text-2xl font-bold text-[hsl(50,100%,52%)]">
              {userRank ? `#${userRank}` : "N/A"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold">
              Best Entry
            </span>
            <span className="text-xl font-medium text-[#EDE6DA]">
              {userEntry ? `${userEntry.cqpm ?? 0} QPM` : "No attempts"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#C8BCAD]">
            Filtered by:{" "}
            {filterOptions
              .find((o) => o.key === "mode")
              ?.values.find((v) => v.value === (modeFilter || "all"))?.label || "All"}{" "}
            ·{" "}
            {filterOptions
              .find((o) => o.key === "difficulty")
              ?.values.find((v) => v.value === (diffFilter || "all"))?.label || "All"}{" "}
            ·{" "}
            {filterOptions
              .find((o) => o.key === "operators")
              ?.values.find((v) => v.value === (operatorFilter || "all"))?.label ||
              "All Types"}{" "}
            ·{" "}
            {filterOptions
              .find((o) => o.key === "timeframe")
              ?.values.find((v) => v.value === (timeframeFilter || "all"))?.label || "All Time"}
          </span>
        </div>
      </div>
    </div>
  )
}

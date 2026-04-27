import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import FilterBar from "@/components/FilterBar"

export default async function AttemptHistory({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createClient()
  const modeFilter = searchParams.mode
  const diffFilter = searchParams.difficulty

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
    .from("entries")
    .select("*")
    .order("percentage", { ascending: false })

  if (modeFilter) query = query.eq("session_mode", modeFilter)
  if (diffFilter) query = query.eq("difficulty", diffFilter)
  if (timeframeFilter) query = query.eq("timeframe", timeframeFilter)

  let { data: leaderboard, error } = await query

  if (error || !leaderboard) {
    leaderboard = [
      { user_email: "expert@math.ninja", percentage: 100, created_at: new Date(Date.now() - 3600000).toISOString(), _primaryScore: 100 },
      { user_email: "demo@local.test", percentage: 95, created_at: new Date(Date.now() - 7200000).toISOString(), _primaryScore: 95 },
    ]
  }

  // Find user's best entry and rank
  const userEntry = leaderboard.find(e => e.user_id === user?.id || e.user_email === "you@local.test")
  const userRank = userEntry ? leaderboard.indexOf(userEntry) + 1 : null
  const topN = leaderboard.slice(0, 10)

  const filterOptions = [
    {
      label: "Timeframe",
      key: "timeframe",
      values: [
        { label: "All Time", value: "all" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" },
      ],
    },
    {
      label: "Mode",
      key: "mode",
      values: [
        { label: "All", value: "all" },
        { label: "Timed", value: "timed" },
        { label: "Fixed", value: "fixed" },
      ],
    },
    {
      label: "Difficulty",
      key: "difficulty",
      values: [
        { label: "All", value: "all" },
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" },
      ],
    },
  ]

  return (
    <div className="w-full flex-1 flex flex-col py-8 font-['Inter'] relative">
      <div className="w-full space-y-6 pb-32">
        <div className="border-b border-[#2C2920] pb-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-[#EDE6DA]">Leaderboard</h1>
          <p className="text-[#C8BCAD] mt-2">Global ranking by score (Top 10)</p>
        </div>

        <FilterBar options={filterOptions} />
        <div className="overflow-x-auto rounded-md border border-[#2C2920] bg-[#17150F]">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 border-b border-[#2C2920] bg-[#211E17] text-left text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 border-b border-[#2C2920] bg-[#211E17] text-left text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-4 border-b border-[#2C2920] bg-[#211E17] text-left text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 border-b border-[#2C2920] bg-[#211E17] text-left text-sm font-semibold text-[#C8BCAD] uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2920]">
              {topN?.map((entry, index) => {
                const isUser = entry.user_id === user?.id || entry.user_email === "you@local.test"
                return (
                  <tr key={index} className={`hover:bg-[#211E17] transition-colors ${isUser ? "bg-[#211E17]/50" : ""}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD]">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-[#EDE6DA]">
                      {entry.user_email} {isUser && "(You)"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-[hsl(50,100%,52%)]">
                      {entry.percentage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD]">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
              {topN.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#C8BCAD]">
                    No entries found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Personal Rank */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#17150F] border-t border-[#2C2920] px-20 py-6 flex items-center justify-between z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold">Your Rank</span>
            <span className="text-2xl font-bold text-[hsl(50,100%,52%)]">
              {userRank ? `#${userRank}` : "N/A"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD] font-bold">Best Entry</span>
            <span className="text-xl font-medium text-[#EDE6DA]">
              {userEntry ? userEntry.percentage : "No attempts"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#C8BCAD]">
            Filtered by: {modeFilter || "All"} · {diffFilter || "All"} · {timeframeFilter || "All Time"}
          </span>
        </div>
      </div>
    </div>
  )
}

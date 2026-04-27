import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function AttemptHistory() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (!user && !authError) {
    return redirect("/login")
  }

  let { data: leaderboard, error } = await supabase
    .from("entries")
    .select("*")
    .range(0, 9)
    .order("percentage", { ascending: false })

  if (error || !leaderboard) {
    leaderboard = [
      { user_email: "expert@math.ninja", percentage: 100, created_at: new Date().toISOString() },
      { user_email: "demo@local.test", percentage: 95, created_at: new Date().toISOString() },
      { user_email: "guest@numerify.me", percentage: 82, created_at: new Date(Date.now() - 86400000).toISOString() }
    ]
  }

  return (
    <div className="w-full flex-1 flex flex-col py-8 font-['Inter']">
      <div className="w-full space-y-6">
        <div className="border-b border-[#2C2920] pb-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-[#EDE6DA]">Leaderboard</h1>
          <p className="text-[#C8BCAD] mt-2">Global ranking by score</p>
        </div>
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
              {leaderboard?.map((entry, index) => {
                return (
                  <tr key={index} className="hover:bg-[#211E17] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD] font-['JetBrains_Mono']">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-[#EDE6DA]">
                      {entry.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-[hsl(50,100%,52%)] font-['JetBrains_Mono']">
                      {entry.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-[#C8BCAD] font-['JetBrains_Mono']">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

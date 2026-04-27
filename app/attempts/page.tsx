import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { SessionWithAnswers, QuestionSubType } from "@/lib/types/database"

import { SUB_TYPE_LABELS, formatOperatorSet, formatDate } from "@/lib/formatters"

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
    error: authError,
  } = await supabase.auth.getUser()

  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"

  if (!user && !authError && !isMockAuth) {
    return redirect("/login")
  }

  const activeUser = user || { id: "mock-id", email: "demo@local.test" }

  let sessions: SessionWithAnswers[] = []

  if (user) {
    let query = supabase
      .from("sessions")
      .select(`
        *,
        session_answers (
          *,
          question:questions (*)
        )
      `)
      .eq("user_id", activeUser.id)
      .order("completed_at", { ascending: false })
      .limit(50)

    if (modeFilter) query = query.eq("session_mode", modeFilter)
    if (diffFilter) query = query.eq("difficulty", diffFilter)

    const { data, error } = await query

    if (!error && data) {
      sessions = data as unknown as SessionWithAnswers[]
    }
  }

  // Mock data fallback if no real sessions
  if (sessions.length === 0 && !user) {
    sessions = [
      {
        id: "mock-1",
        user_id: "mock-id",
        category: "arithmetic",
        operator_set: ["addition", "subtraction"],
        allow_negatives: false,
        session_mode: "timed",
        difficulty: "Medium",
        duration_seconds: 60,
        question_limit: null,
        correct_count: 12,
        total_count: 15,
        accuracy: 80,
        percentile: 72.5,
        completed_at: new Date().toISOString(),
        session_answers: [],
      },
    ] as unknown as SessionWithAnswers[]
  }

  // Client-side filter for mock data (when user is null/mock)
  if (modeFilter || diffFilter) {
    sessions = sessions.filter(s => {
      if (modeFilter && s.session_mode !== modeFilter) return false
      if (diffFilter && s.difficulty !== diffFilter) return false
      return true
    })
  }

  const filterOptions = [
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
    <div className="w-full flex-1 flex flex-col py-8 font-['Inter']">
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="border-b border-[#2C2920] pb-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-[#EDE6DA]">Session History</h1>
          <p className="text-[#C8BCAD] mt-2">Your past practice sessions</p>
        </div>

        <FilterBar options={filterOptions} />

        {sessions.length === 0 ? (
          <div className="text-center py-16 text-[#C8BCAD]">
            No sessions yet. Play a game to see your history here.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const accuracy = Number(session.accuracy).toFixed(1)
              const isGood   = session.accuracy >= 80

              return (
                <details
                  key={session.id}
                  className="rounded-xl border border-[#2C2920] bg-[#17150F] overflow-hidden group"
                >
                  {/* Session summary row */}
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#211E17] transition-colors list-none">
                    <div className="flex items-center gap-6">
                      {/* Accuracy badge */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                          isGood
                            ? "border-[hsl(50,100%,52%)] text-[hsl(50,100%,52%)]"
                            : "border-red-500 text-red-400"
                        }`}
                      >
                        {accuracy}%
                      </div>

                      <div className="flex flex-col gap-1">
                        {/* Operator set + negatives */}
                        <div className="flex items-center gap-2">
                          <span className="text-[#EDE6DA] font-semibold text-lg">
                            {formatOperatorSet(session.operator_set)}
                          </span>
                          {session.allow_negatives && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-[#2C2920] text-[#C8BCAD]">
                              negatives
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[#C8BCAD]">
                          {session.correct_count}/{session.total_count} correct
                          {" · "}
                          {session.session_mode === "timed"
                            ? `${session.duration_seconds}s`
                            : `${session.question_limit}Q fixed`}
                          {" · "}
                          {formatDate(session.completed_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      {session.percentile !== null && (
                        <div className="flex flex-col items-end">
                          <span className="text-[hsl(50,100%,52%)] font-bold text-xl">
                            Top {(100 - (session.percentile ?? 0)).toFixed(1)}%
                          </span>
                          <span className="text-xs text-[#C8BCAD]">vs same type</span>
                        </div>
                      )}
                      <span className="text-[#2C2920] group-open:rotate-180 transition-transform text-xl">▼</span>
                    </div>
                  </summary>

                  {/* Question breakdown */}
                  {session.session_answers && session.session_answers.length > 0 && (
                    <div className="border-t border-[#2C2920] px-6 py-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[#C8BCAD] text-left border-b border-[#2C2920]">
                            <th className="pb-2 font-medium w-8">#</th>
                            <th className="pb-2 font-medium">Question</th>
                            <th className="pb-2 font-medium">Your Answer</th>
                            <th className="pb-2 font-medium">Correct Answer</th>
                            <th className="pb-2 font-medium text-right">Time</th>
                            <th className="pb-2 font-medium text-right w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2920]">
                          {session.session_answers
                            .sort((a, b) => a.order_in_session - b.order_in_session)
                            .map((answer) => (
                              <tr key={answer.id} className="hover:bg-[#211E17] transition-colors">
                                <td className="py-2 text-[#C8BCAD]">
                                  {answer.order_in_session}
                                </td>
                                <td className="py-2 text-[#EDE6DA]">
                                  {answer.question?.question_text ?? "—"}
                                </td>
                                <td
                                  className={`py-2 ${
                                    answer.is_correct ? "text-[hsl(50,100%,52%)]" : "text-red-400"
                                  }`}
                                >
                                  {answer.user_answer}
                                </td>
                                <td className="py-2 text-[#C8BCAD]">
                                  {answer.question?.correct_answer ?? "—"}
                                </td>
                                <td className="py-2 text-[#C8BCAD] text-right text-xs">
                                  {answer.time_taken_ms !== null
                                    ? `${(answer.time_taken_ms / 1000).toFixed(1)}s`
                                    : "—"}
                                </td>
                                <td className="py-2 text-right">
                                  {answer.is_correct ? (
                                    <span className="text-[hsl(50,100%,52%)]">✓</span>
                                  ) : (
                                    <span className="text-red-400">✗</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {session.session_answers?.length === 0 && (
                    <div className="border-t border-[#2C2920] px-6 py-4 text-[#C8BCAD] text-sm">
                      No question detail available for this session.
                    </div>
                  )}
                </details>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

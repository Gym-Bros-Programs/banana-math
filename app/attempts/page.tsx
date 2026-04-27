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
  const durationFilter = searchParams.duration
  const questionsFilter = searchParams.questions

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true"

  if (!user && !authError && !isMockAuth) {
    return redirect("/login")
  }

  let sessions: SessionWithAnswers[] = []

  // If logged in, fetch user's sessions. If not, fetch sessions where user_id is null (Guest sessions)
  let query = supabase
    .from("sessions")
    .select(`
      *,
      session_answers (
        *,
        question:questions (*)
      )
    `)
    .order("completed_at", { ascending: false })
    .limit(50)

  if (user) {
    query = query.eq("user_id", user.id)
  } else {
    query = query.is("user_id", null)
  }

  if (modeFilter && modeFilter !== "all") query = query.eq("session_mode", modeFilter)
  if (diffFilter && diffFilter !== "all") query = query.eq("difficulty", diffFilter)
  if (durationFilter && durationFilter !== "all") query = query.eq("duration_seconds", durationFilter)
  if (questionsFilter && questionsFilter !== "all") query = query.eq("question_limit", questionsFilter)

  const { data, error } = await query

  if (!error && data) {
    sessions = data as unknown as SessionWithAnswers[]
  }

  // Mock data fallback is handled directly in server.ts when MOCK_DB is true

  // Client-side filter for mock data (when user is null/mock)
  if (modeFilter || diffFilter || durationFilter || questionsFilter) {
    sessions = sessions.filter(s => {
      if (modeFilter && s.session_mode !== modeFilter) return false
      if (diffFilter && s.difficulty !== diffFilter) return false
      if (durationFilter && String(s.duration_seconds) !== durationFilter) return false
      if (questionsFilter && String(s.question_limit) !== questionsFilter) return false
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
        { label: "Question Based", value: "fixed" },
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

  if (modeFilter === "timed") {
    filterOptions.push({
      label: "Length",
      key: "duration",
      values: [
        { label: "All", value: "all" },
        { label: "15s", value: "15" },
        { label: "30s", value: "30" },
        { label: "60s", value: "60" },
        { label: "120s", value: "120" },
      ],
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
        { label: "100Q", value: "100" },
      ],
    })
  }

  return (
    <div className="w-full flex-1 flex flex-col pt-10 pb-8 font-['Inter']">
      <div className="w-full">

        {/* Header */}
        <div className="border-b border-[#2C2920] pb-4 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(50,100%,52%)]">Session History</h1>
          <p className="text-[#C8BCAD] mt-1 text-sm">Your past practice sessions</p>
        </div>

        <FilterBar options={filterOptions} />

        {sessions.length === 0 ? (
          <div className="text-center py-16 text-[#C8BCAD]">
            No sessions yet. Play a game to see your history here.
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const accuracy = Number(session.accuracy).toFixed(1)
              const isGood   = session.accuracy >= 80

              return (
                <details
                  key={session.id}
                  className="rounded-xl border border-[#2C2920] bg-[#17150F] overflow-hidden group"
                >
                  {/* Session summary row */}
                  <summary className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-[#211E17] transition-colors list-none">
                    <div className="flex items-center gap-6">
                      {/* QPM Score */}
                      <div className="flex flex-col items-center min-w-[70px]">
                        <span className="text-2xl font-black text-[hsl(50,100%,52%)] leading-none">
                          {session.cqpm ?? 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[#C8BCAD] font-bold mt-1">QPM</span>
                      </div>

                      {/* Accuracy badge */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xs border-2 ${
                          isGood
                            ? "border-[hsl(50,100%,52%)] text-[hsl(50,100%,52%)]"
                            : "border-red-500 text-red-400"
                        }`}
                      >
                        {accuracy}%
                      </div>

                      {/* Unified Info Row */}
                      <div className="flex items-center gap-5 text-xl text-[#EDE6DA] font-semibold">
                        {/* Operator Chip - compact */}
                        <div className="bg-[#211E17] px-2 py-0.5 rounded border border-[#2C2920] text-[#EDE6DA] font-bold text-xs flex items-center gap-1.5">
                          <span className="text-base font-medium">{formatOperatorSet(session.operator_set)}</span>
                          {session.allow_negatives && <span className="w-0.5 h-0.5 rounded-full bg-[#C8BCAD]/30" />}
                          {session.allow_negatives && <span className="text-[8px] text-[#C8BCAD]">NEG</span>}
                        </div>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        <span className="flex items-center gap-2 whitespace-nowrap">
                          {session.correct_count}/{session.total_count} <span className="text-[10px] uppercase tracking-widest text-[#C8BCAD]">correct</span>
                        </span>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        <span className="text-[#C8BCAD] whitespace-nowrap">
                          {session.session_mode === "timed"
                            ? `${session.duration_seconds}s`
                            : `${session.question_limit} Q`}
                        </span>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        <span className="text-[#8B8476] text-base font-normal whitespace-nowrap">
                          {formatDate(session.completed_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      {session.percentile !== null && (
                        <div className="flex flex-col items-end mr-4">
                          {(session.percentile ?? 0) <= 50 ? (
                            <>
                              <span className="text-[hsl(50,100%,52%)] font-black text-3xl">
                                Top {(session.percentile ?? 0).toFixed(1)}%
                              </span>
                              <span className="text-xs text-[#C8BCAD] font-medium uppercase tracking-tight">
                                vs same type
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-red-400 font-bold uppercase tracking-tight py-2">
                              Below average user
                            </span>
                          )}
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

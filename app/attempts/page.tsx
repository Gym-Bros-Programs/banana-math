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
  const operatorFilter = searchParams.operators || "all"

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

  if (operatorFilter && operatorFilter !== "all") {
    const { OPERATOR_PRESETS } = require("@/lib/types/database")
    const ops = OPERATOR_PRESETS[operatorFilter as any]
    if (ops && ops.length > 0) {
      query = query.contains("operator_set", [...ops].sort())
    }
  }

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
        { label: "÷ only", value: "division" },
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
    <div
      className="w-full flex flex-col pt-10 pb-4 font-['Inter'] overflow-hidden"
      style={{ height: 'calc(100vh - 115px)' }}
    >
      <div className="w-full shrink-0">
        {/* Header */}
        <div className="border-b border-[#2C2920] pb-4 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-[hsl(50,100%,52%)]">Session History</h1>
          <p className="text-[#C8BCAD] mt-1 text-sm">Your past practice sessions</p>
        </div>

        <FilterBar options={filterOptions} currentParams={searchParams} />
      </div>

      <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#2C2920] scrollbar-track-transparent">
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-[#C8BCAD]">
            No sessions yet. Play a game to see your history here.
          </div>
        ) : (
          <>
            {sessions.map((session) => {
              const accuracy = Number(session.accuracy).toFixed(1)
              const isGood = session.accuracy >= 80

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

                      {/* Accuracy badge - SVG progress circle */}
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                          {/* Red track (incorrect/background) */}
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="#ef4444"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Yellow progress (accuracy) */}
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="hsl(50,100%,52%)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={150.8}
                            strokeDashoffset={150.8 - (150.8 * session.accuracy) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                          />
                        </svg>
                        <span className="absolute text-white font-black text-[10px]">
                          {accuracy}%
                        </span>
                      </div>

                      {/* Unified Info Row */}
                      <div className="flex items-center gap-6 text-[#EDE6DA] font-semibold">
                        {/* Operator Chip */}
                        <div className="bg-[#211E17] px-2.5 py-1 rounded border border-[#2C2920] text-[#EDE6DA] font-bold text-xs flex items-center gap-1.5 min-w-[95px] justify-center">
                          <span className="text-base leading-none">{formatOperatorSet(session.operator_set)}</span>
                          {session.allow_negatives && <span className="w-1 h-1 rounded-full bg-red-500/50" />}
                        </div>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        {/* Stats Segment */}
                        <div className="flex items-center gap-3 whitespace-nowrap min-w-[155px]">
                          <div className="flex items-baseline gap-1 min-w-[80px] justify-end">
                            <span className="text-xl font-bold leading-none">{session.correct_count}/{session.total_count}</span>
                            <span className="text-[9px] uppercase tracking-widest text-[#C8BCAD] font-bold">correct</span>
                          </div>
                          <div className="min-w-[42px] flex justify-center">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase tracking-tighter ${session.difficulty === "Hard" ? "border-red-500/30 text-red-400 bg-red-500/5" :
                                session.difficulty === "Medium" ? "border-orange-500/30 text-orange-400 bg-orange-500/5" :
                                  "border-[hsl(50,100%,52%)]/30 text-[hsl(50,100%,52%)] bg-[hsl(50,100%,52%)]/5"
                              }`}>
                              {session.difficulty === "Medium" ? "MED" : session.difficulty?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        {/* Length Segment */}
                        <div className="min-w-[55px] text-center">
                          <span className="text-[#C8BCAD] text-lg font-medium">
                            {session.session_mode === "timed"
                              ? `${session.duration_seconds}s`
                              : `${session.question_limit}Q`}
                          </span>
                        </div>

                        <div className="h-4 w-px bg-[#2C2920]" />

                        {/* Date Segment */}
                        <span suppressHydrationWarning className="text-[#8B8476] text-sm font-normal whitespace-nowrap">
                          {formatDate(session.completed_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right min-w-[140px] justify-end">
                      <span className="text-[#2C2920] group-open:rotate-180 transition-transform text-xl">▼</span>
                    </div>
                  </summary>

                  {/* Question breakdown */}
                  {session.session_answers && session.session_answers.length > 0 && (
                    <div className="border-t border-[#2C2920] px-6 py-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[#C8BCAD] text-left border-b border-[#2C2920]">
                            <th className="pb-2 font-medium w-8 border-r border-[#2C2920]">#</th>
                            <th className="pb-2 font-medium border-r border-[#2C2920] px-4">Question</th>
                            <th className="pb-2 font-medium border-r border-[#2C2920] px-4">Your Answer</th>
                            <th className="pb-2 font-medium border-r border-[#2C2920] px-4">Correct Answer</th>
                            <th className="pb-2 font-medium text-right border-r border-[#2C2920] px-4">Time</th>
                            <th className="pb-2 font-medium text-right w-8 px-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C2920]">
                          {session.session_answers
                            .sort((a, b) => a.order_in_session - b.order_in_session)
                            .map((answer) => (
                              <tr key={answer.id} className="hover:bg-[#211E17] transition-colors">
                                <td className="py-2 text-[#C8BCAD] border-r border-[#2C2920]">
                                  {answer.order_in_session}
                                </td>
                                <td className="py-2 text-[#EDE6DA] border-r border-[#2C2920] px-4">
                                  {answer.question?.question_text ?? "—"}
                                </td>
                                <td
                                  className={`py-2 border-r border-[#2C2920] px-4 ${answer.is_correct ? "text-[hsl(50,100%,52%)]" : "text-red-400"
                                    }`}
                                >
                                  {answer.user_answer}
                                </td>
                                <td className="py-2 text-[#C8BCAD] border-r border-[#2C2920] px-4">
                                  {answer.question?.correct_answer ?? "—"}
                                </td>
                                <td className="py-2 text-[#C8BCAD] text-right text-xs border-r border-[#2C2920] px-4">
                                  {answer.time_taken_ms !== null
                                    ? `${(answer.time_taken_ms / 1000).toFixed(1)}s`
                                    : "—"}
                                </td>
                                <td className="py-2 text-right px-4">
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
                  {session.session_answers?.length > 0 &&
                    session.session_answers.every((a: any) => !a.question) && (
                    <div className="border-t border-[#2C2920] px-6 py-4 text-[#C8BCAD] text-sm">
                      Question details are no longer available — the question set was updated. Your score and ranking are preserved.
                    </div>
                  )}
                </details>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

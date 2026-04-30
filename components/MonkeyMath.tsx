"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import ControlBar from "@/components/ControlBar"
import type { Type, Mode, Difficulty } from "@/components/ControlBar"
import { getQuestionsForSession, createSession, saveSessionAnswers } from "@/lib/actions/game-actions"
import type { Question, SessionConfig, QuestionSubType } from "@/lib/types/database"
import { GUEST_SESSION_LIMIT } from "@/lib/types/database"

// Type to operator set mapping
const TYPE_TO_OPS: Record<Type, QuestionSubType[]> = {
  "+ − × ÷": ["addition", "subtraction", "multiplication", "division"],
  "+ −": ["addition", "subtraction"],
  "× ÷": ["multiplication", "division"],
  "+ only": ["addition"],
  "− only": ["subtraction"],
  "× only": ["multiplication"],
  "÷ only": ["division"],
}

// Session constants
const DEFAULT_TIME = 15
const GUEST_STORAGE_KEY = "banana_math_guest_sessions"
const SETTINGS_STORAGE_KEY = "banana_math_game_settings"
type GamePhase = "settings" | "playing" | "results"

interface AnswerRecord {
  questionId: string; userAnswer: string; isCorrect: boolean
  timeTakenMs: number; orderInSession: number; question: Question
}

function saveGuestSession(s: any) {
  if (typeof window === "undefined") return
  const prev: any[] = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) ?? "[]")
  prev.unshift(s)
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(prev.slice(0, GUEST_SESSION_LIMIT)))
}
function guestCount() {
  if (typeof window === "undefined") return 0
  return JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) ?? "[]").length
}

export default function MonkeyMath({ isGuest = true }: { isGuest?: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const phase = (searchParams.get("phase") as GamePhase) || "settings"

  const setPhase = useCallback((newPhase: GamePhase, method: "push" | "replace" = "push") => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPhase === "settings") {
      params.delete("phase")
    } else {
      params.set("phase", newPhase)
    }
    const newUrl = `${pathname}?${params.toString()}`
    
    if (method === "push") {
      router.push(newUrl, { scroll: false })
    } else {
      router.replace(newUrl, { scroll: false })
    }
  }, [pathname, router, searchParams])

  const [selectedType, setSelectedType] = useState<Type>("+ − × ÷")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Easy")
  const [selectedLength, setSelectedLength] = useState(DEFAULT_TIME)
  const [selectedMode, setSelectedMode] = useState<Mode>("timed")

  const [questionPool, setQuestionPool] = useState<Question[]>([])
  const [poolIndex, setPoolIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const answersRef = useRef<AnswerRecord[]>([]) // Ref to avoid stale closure in timer
  const [questionStart, setQuestionStart] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [penaltyCount, setPenaltyCount] = useState(0)
  const [lastPenalty, setLastPenalty] = useState<number | null>(null)
  const [guestWarning, setGuestWarning] = useState(false)
  const [isLoadingPool, setIsLoadingPool] = useState(false)
  const [poolError, setPoolError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input whenever a new question appears
  useEffect(() => {
    if (phase === "playing" && currentQuestion) {
      inputRef.current?.focus()
    }
  }, [currentQuestion, phase])

  // Load saved settings once after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.type) setSelectedType(parsed.type)
        if (parsed.difficulty) setSelectedDifficulty(parsed.difficulty)
        if (parsed.mode) setSelectedMode(parsed.mode)
        if (parsed.length) setSelectedLength(parsed.length)
      }
    } catch {}
  }, [])

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      type: selectedType,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      length: selectedLength
    }))
  }, [selectedType, selectedDifficulty, selectedMode, selectedLength])

  // Sync back button / URL changes
  useEffect(() => {
    if (phase === "settings") {
      setTimerActive(false)
      setAnswers([])
      setCurrentQuestion(null)
      // Only reset timeLeft if we aren't currently playing
      setTimeLeft(selectedLength)
      setPoolError(null)
    }
  }, [phase, selectedLength])

  // Handle page refresh or direct links (e.g. user loads /?phase=playing with empty state)
  useEffect(() => {
    if (phase !== "settings" && questionPool.length === 0 && !isLoadingPool) {
      setPhase("settings", "replace")
    }
  }, [phase, questionPool.length, isLoadingPool, setPhase])

  const correctCount = answers.filter((a) => a.isCorrect).length
  const totalCount = answers.length

  const activeOps: QuestionSubType[] = TYPE_TO_OPS[selectedType] ?? ["addition"]

  // Build session config from current state
  function buildConfig(): SessionConfig {
    return {
      category: "arithmetic",
      operatorSet: activeOps,
      allowNegatives: false,
      sessionMode: selectedMode === "timed" ? "timed" : "fixed",
      durationSeconds: selectedMode === "timed" ? selectedLength : undefined,
      questionLimit: selectedMode === "question based" ? selectedLength : undefined,
    }
  }

  const nextQuestion = useCallback((pool: Question[], idx: number) => {
    if (idx < pool.length) {
      setCurrentQuestion(pool[idx])
      setPoolIndex(idx + 1)
      setUserInput("")
      setIsCorrect(null)
      setQuestionStart(Date.now())
    }
  }, [])

  // Timer tick — pure decrement only, no side-effects inside state updater
  useEffect(() => {
    if (!timerActive) return
    const id = setInterval(() => {
      if (selectedMode === "timed") {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
      } else {
        setTimeElapsed((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [timerActive, selectedMode])

  // Detect timer expiry — runs AFTER the render where timeLeft hits 0
  const expiryHandled = useRef(false)
  useEffect(() => {
    if (timeLeft === 0 && phase === "playing" && !expiryHandled.current) {
      expiryHandled.current = true
      setTimerActive(false)
      handleSessionEnd(answersRef.current)
    }
    if (timeLeft > 0) expiryHandled.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase])

  function handleStart() {
    if (activeOps.length === 0) return
    setIsLoadingPool(true)

    const config = buildConfig()
    getQuestionsForSession(config, selectedDifficulty).then(pool => {
      if (pool.length === 0) {
        setPoolError(`No ${selectedDifficulty} questions found for ${selectedType} in the database.`)
        setIsLoadingPool(false)
        return
      }

      setPoolError(null)
      setQuestionPool(pool)
      setAnswers([])
      setPoolIndex(0)
      setPenaltyCount(0)
      setLastPenalty(null)

      if (selectedMode === "timed") {
        setTimeLeft(selectedLength)
      } else {
        setTimeElapsed(0)
      }
      setTimerActive(true)
      setPhase("playing")
      nextQuestion(pool, 0)
      setIsLoadingPool(false)
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting || !userInput || !currentQuestion) return
    setIsSubmitting(true)

    const timeTaken = Date.now() - questionStart
    const wasCorrect = userInput.trim() === currentQuestion.correct_answer
    setIsCorrect(wasCorrect)

    if (!wasCorrect) {
      const newPenaltyCount = penaltyCount + 1
      setPenaltyCount(newPenaltyCount)
      setLastPenalty(newPenaltyCount)

      if (selectedMode === "timed") {
        setTimeLeft(prev => Math.max(0, prev - newPenaltyCount))
      } else {
        setTimeElapsed(prev => prev + newPenaltyCount)
      }

      // Clear penalty effect after 1s
      setTimeout(() => setLastPenalty(null), 1000)
    }

    const record: AnswerRecord = {
      questionId: currentQuestion.id, userAnswer: userInput.trim(),
      isCorrect: wasCorrect, timeTakenMs: timeTaken,
      orderInSession: totalCount + 1, question: currentQuestion,
    }
    const newAnswers = [...answers, record]
    setAnswers(newAnswers)
    answersRef.current = newAnswers // Keep ref in sync

    if (selectedMode === "question based" && newAnswers.length >= selectedLength) {
      setTimeout(() => handleSessionEnd(newAnswers), 400)
      setIsSubmitting(false); return
    }
    setTimeout(() => { nextQuestion(questionPool, poolIndex); setIsSubmitting(false) }, 300)
  }

  async function handleSessionEnd(finalAnswers = answers) {
    setTimerActive(false)
    setPhase("results", "replace")

    const config = buildConfig()
    const correct = finalAnswers.filter((a) => a.isCorrect).length
    const total = finalAnswers.length
    console.log("🏁 handleSessionEnd called:", { total, correct, difficulty: selectedDifficulty })
    if (total === 0) {
      console.warn("⚠️ Session ended with 0 answers, skipping save.")
      return
    }

    const finalT = selectedMode === "timed" ? selectedLength : timeElapsed

    if (isGuest) {
      if (guestCount() >= GUEST_SESSION_LIMIT - 1) setGuestWarning(true)
      saveGuestSession({
        id: `guest-${Date.now()}`, category: "arithmetic",
        operator_set: activeOps, allow_negatives: false,
        session_mode: selectedMode === "timed" ? "timed" : "fixed",
        duration_seconds: finalT,
        question_limit: selectedMode === "question based" ? selectedLength : null,
        correct_count: correct, total_count: total,
        difficulty: selectedDifficulty,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        is_leaderboard_eligible: false, completed_at: new Date().toISOString(),
        session_answers: finalAnswers,
      })
      return
    }

    try {
      const sessionId = await createSession(config, correct, total, finalT, selectedDifficulty)
      console.log("📝 createSession returned:", sessionId)

      if (sessionId !== "mock-session-id") {
        console.log("💾 Saving session answers for:", sessionId)
        await saveSessionAnswers(sessionId, finalAnswers.map((a) => ({
          questionId: a.questionId, userAnswer: a.userAnswer,
          isCorrect: a.isCorrect, timeTakenMs: a.timeTakenMs,
          orderInSession: a.orderInSession,
        })))
        console.log("✅ Session and answers saved successfully!")
      }
    } catch (err) {
      console.error("❌ Exception in handleSessionEnd:", err)
    }
  }

  function handleAbandon() {
    setTimerActive(false)
    setAnswers([])
    setCurrentQuestion(null)
    setTimeLeft(selectedLength)
    setPhase("settings")
  }

  function handleBackToSettings() {
    setAnswers([])
    setCurrentQuestion(null)
    setGuestWarning(false)
    setPhase("settings")
  }

  function getBoxBackground() {
    if (phase === "settings") return "bg-transparent h-[320px]"
    if (phase === "results") return "bg-foreground/30 shadow-lg py-12 w-[750px]"
    return "bg-foreground/30 w-[650px] h-[450px] shadow-lg"
  }

  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)

  const pct = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full text-text">
      {phase === "settings" ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-32 w-full">
          <ControlBar
            selectedType={selectedType} onTypeChange={setSelectedType}
            selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty}
            selectedLength={selectedLength} onLengthChange={setSelectedLength}
            selectedMode={selectedMode} onModeChange={setSelectedMode}
          />
          <button
            onClick={handleStart}
            disabled={isLoadingPool}
            className="w-[350px] py-6 bg-btn-background-hover text-black text-3xl font-bold rounded-2xl shadow-xl hover:bg-btn-background hover:scale-105 transition-all active:scale-95 disabled:opacity-40"
          >
            {isLoadingPool ? "Loading..." : "Start"}
          </button>
          {poolError && (
            <div className="text-red-500 font-bold text-lg animate-bounce text-center max-w-[400px]">
              {poolError}
            </div>
          )}
        </div>
      ) : phase === "playing" ? (
        <div className="relative flex items-center justify-between w-[650px] h-[110px] px-12 py-6 rounded-2xl bg-foreground/30 shadow-lg text-[#EDE6DA] font-medium">
          <div className="flex-1 flex justify-start">
            <button onClick={handleStart}
              className="px-6 py-2 text-lg border-2 border-btn-background text-btn-background rounded-full hover:bg-btn-background/10 transition-all active:scale-95">
              Restart
            </button>
          </div>
          <div className="relative flex-1 flex flex-col items-center justify-center">
            {lastPenalty !== null && (
              <div className="absolute -top-6 text-red-500 font-bold text-2xl animate-float-up pointer-events-none">
                {selectedMode === "timed" ? `-${lastPenalty}s` : `+${lastPenalty}s`}
              </div>
            )}
            <div className={`text-5xl font-bold tracking-widest text-center drop-shadow-md transition-colors duration-300 ${selectedMode === "timed" && timeLeft <= 5 ? "text-red-500" : "text-btn-background"
              }`}>
              {selectedMode === "timed" ? timeLeft : timeElapsed}s
            </div>
            {selectedMode === "question based" && (
              <div className="text-muted text-xs mt-1 uppercase tracking-tighter">
                {totalCount + 1} / {selectedLength}
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-end">
            <button onClick={handleAbandon}
              className="px-6 py-2 text-lg border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition-all active:scale-95">
              Stop
            </button>
          </div>
        </div>
      ) : null}

      {phase !== "settings" && (
        <div className={`Box flex flex-col items-center justify-center rounded-2xl mt-12 transition-all duration-300 ${getBoxBackground()}`}>


          {phase === "playing" && currentQuestion && (
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full">
            <p className="Problem text-text-active text-7xl pb-12 text-center font-bold">
              {currentQuestion.question_text}
            </p>
            <input
              ref={inputRef}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
              type="number"
              readOnly={isSubmitting}
              className={`text-6xl w-80 rounded-xl p-4 mb-5 text-center focus:outline-none transition-all duration-100 ${isCorrect === true ? "bg-green-600 text-white" :
                  isCorrect === false ? "bg-red-600 text-white" :
                    "bg-input-box/20 text-black"
                  }`}
            />
            </form>
          )}

          {phase === "results" && (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 gap-6 px-8 w-full">
              <div className="flex items-center gap-12">
                <div className="w-48 h-48 rounded-full shadow-lg border-8 border-[#2C2920] relative flex items-center justify-center"
                  style={{ background: totalCount > 0 ? `conic-gradient(hsl(50,100%,52%) 0% ${pct}%, #ef4444 ${pct}% 100%)` : "#2C2920" }}>
                  <div className="w-32 h-32 bg-[#17150F] rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-bold text-[#EDE6DA]">{pct.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-left text-2xl font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-[hsl(50,100%,52%)]" />
                    <span className="text-[#EDE6DA]">Correct: <span className="font-bold">{correctCount}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-red-500" />
                    <span className="text-[#EDE6DA]">Incorrect: <span className="font-bold">{totalCount - correctCount}</span></span>
                  </div>
                </div>
              </div>

              {guestWarning && (
                <div className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 mb-6 text-sm text-amber-300 text-center">
                  Your guest history is full: {" "}
                  <a href="/login" className="underline font-semibold hover:text-amber-100">create an account</a>
                  {" "}to save your full progress!
                </div>
              )}

              {answers.length > 0 && (
                <div className="w-full">
                  <button
                    onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                    className="group w-full flex flex-col items-center gap-2 pt-4 border-t border-[#2C2920] hover:text-[#EDE6DA] transition-all"
                  >
                    <div className="flex items-center gap-2 text-muted text-lg">
                      Total Questions: <span className="font-bold text-[#EDE6DA]">{totalCount}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isBreakdownOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    {!isBreakdownOpen && (
                      <span className="text-xs uppercase tracking-widest opacity-50 font-semibold text-muted">
                        View Breakdown
                      </span>
                    )}
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${isBreakdownOpen ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-[#2C2920] bg-black/20">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-[#211E17] z-10 shadow-sm">
                            <tr className="text-[#C8BCAD] text-left">
                              <th className="px-4 py-3 font-semibold">#</th>
                              <th className="px-4 py-3 font-semibold">Question</th>
                              <th className="px-4 py-3 font-semibold">Yours</th>
                              <th className="px-4 py-3 font-semibold">Answer</th>
                              <th className="px-4 py-3 font-semibold text-right">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2C2920]">
                            {answers.map((a) => (
                              <tr key={a.orderInSession} className="hover:bg-foreground/10 transition-colors">
                                <td className="px-4 py-2 text-[#C8BCAD] font-medium">{a.orderInSession}</td>
                                <td className="px-4 py-2 font-medium">{a.question.question_text}</td>
                                <td className={`px-4 py-2 font-bold ${a.isCorrect ? "text-[hsl(50,100%,52%)]" : "text-red-400"}`}>
                                  {a.userAnswer}
                                </td>
                                <td className="px-4 py-2 text-[#C8BCAD] font-medium">{a.question.correct_answer}</td>
                                <td className="px-4 py-2 text-right text-[#C8BCAD] text-xs font-mono">
                                  {(a.timeTakenMs / 1000).toFixed(1)}s
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 w-full justify-center mt-4">
                <button onClick={handleBackToSettings}
                  className="flex-1 max-w-[200px] rounded-full border-2 border-muted text-muted px-8 py-3 text-lg font-bold hover:bg-muted/10 transition-all active:scale-95">
                  Back
                </button>
                <button onClick={handleStart}
                  className="flex-1 max-w-[200px] rounded-full bg-btn-background px-8 py-3 text-lg font-bold text-black hover:bg-btn-background-hover transition-transform hover:scale-105 active:scale-95 shadow-lg">
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

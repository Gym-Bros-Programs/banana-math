"use client"

import type { ChangeEvent, FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import ControlBar from "@/components/ControlBar"
import type { Mode, Difficulty, SessionMode } from "@/components/ControlBar"
import { getQuestionsForSession, createSession, saveSessionAnswers } from "@/lib/actions/game-actions"
import type { Question, SessionConfig, QuestionSubType } from "@/lib/types/database"
import { GUEST_SESSION_LIMIT } from "@/lib/types/database"

// Mode to operator set mapping
const MODE_TO_OPS: Record<Mode, QuestionSubType[]> = {
  "+ − × ÷": ["addition","subtraction","multiplication","division"],
  "+ −":     ["addition","subtraction"],
  "× ÷":     ["multiplication","division"],
  "+ only":  ["addition"],
  "− only":  ["subtraction"],
  "× only":  ["multiplication"],
  "÷ only":  ["division"],
}

// Session constants
const DEFAULT_TIME    = 60
const DEFAULT_QCOUNT  = 20
const GUEST_STORAGE_KEY = "banana_math_guest_sessions"
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

export default function MonkeyMath() {
  const [phase,              setPhase]              = useState<GamePhase>("settings")
  const [selectedMode,       setSelectedMode]       = useState<Mode>("+ − × ÷")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Easy")
  const [selectedTime,       setSelectedTime]       = useState(DEFAULT_TIME)
  const [sessionMode,        setSessionMode]        = useState<SessionMode>("seconds")

  const [questionPool,    setQuestionPool]    = useState<Question[]>([])
  const [poolIndex,       setPoolIndex]       = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userInput,       setUserInput]       = useState("")
  const [isCorrect,       setIsCorrect]       = useState<boolean | null>(null)
  const [isSubmitting,    setIsSubmitting]    = useState(false)
  const [answers,         setAnswers]         = useState<AnswerRecord[]>([])
  const [questionStart,   setQuestionStart]   = useState(Date.now())
  const [timeLeft,        setTimeLeft]        = useState(DEFAULT_TIME)
  const [timerActive,     setTimerActive]     = useState(false)
  const [guestWarning,    setGuestWarning]    = useState(false)
  const [isLoadingPool,   setIsLoadingPool]   = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input whenever a new question appears
  useEffect(() => {
    if (phase === "playing" && currentQuestion) {
      inputRef.current?.focus()
    }
  }, [currentQuestion, phase])

  const correctCount = answers.filter((a) => a.isCorrect).length
  const totalCount   = answers.length

  const activeOps: QuestionSubType[] = MODE_TO_OPS[selectedMode] ?? ["addition"]

  // Build session config from current state
  function buildConfig(): SessionConfig {
    return {
      category:        "arithmetic",
      operatorSet:     activeOps,
      allowNegatives:  false,
      sessionMode:     sessionMode === "seconds" ? "timed" : "fixed",
      durationSeconds: sessionMode === "seconds" ? selectedTime : undefined,
      questionLimit:   sessionMode === "questions" ? selectedTime : undefined,
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

  // Timer tick
  useEffect(() => {
    if (!timerActive || phase !== "playing") return
    if (timeLeft <= 0) { handleSessionEnd(); return }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timerActive, timeLeft, phase])

  async function handleStart() {
    if (activeOps.length === 0) return
    setIsLoadingPool(true)

    const config = buildConfig()
    const pool   = await getQuestionsForSession(config, selectedDifficulty)

    setQuestionPool(pool)
    setAnswers([])
    setPoolIndex(0)

    if (sessionMode === "seconds") { setTimeLeft(selectedTime); setTimerActive(true) }

    setPhase("playing")
    nextQuestion(pool, 0)
    setIsLoadingPool(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting || !userInput || !currentQuestion) return
    setIsSubmitting(true)

    const timeTaken  = Date.now() - questionStart
    const wasCorrect = userInput.trim() === currentQuestion.correct_answer
    setIsCorrect(wasCorrect)

    const record: AnswerRecord = {
      questionId: currentQuestion.id, userAnswer: userInput.trim(),
      isCorrect: wasCorrect, timeTakenMs: timeTaken,
      orderInSession: totalCount + 1, question: currentQuestion,
    }
    const newAnswers = [...answers, record]
    setAnswers(newAnswers)

    if (sessionMode === "questions" && newAnswers.length >= selectedTime) {
      setTimeout(() => handleSessionEnd(newAnswers), 400)
      setIsSubmitting(false); return
    }
    setTimeout(() => { nextQuestion(questionPool, poolIndex); setIsSubmitting(false) }, 300)
  }

  async function handleSessionEnd(finalAnswers = answers) {
    setTimerActive(false)
    setPhase("results")

    const config  = buildConfig()
    const correct = finalAnswers.filter((a) => a.isCorrect).length
    const total   = finalAnswers.length
    const sessionId = await createSession(config, correct, total)

    if (sessionId !== "mock-session-id") {
      await saveSessionAnswers(sessionId, finalAnswers.map((a) => ({
        questionId: a.questionId, userAnswer: a.userAnswer,
        isCorrect: a.isCorrect, timeTakenMs: a.timeTakenMs,
        orderInSession: a.orderInSession,
      })))
    } else {
      if (guestCount() >= GUEST_SESSION_LIMIT - 1) setGuestWarning(true)
      saveGuestSession({
        id: `guest-${Date.now()}`, category: "arithmetic",
        operator_set: activeOps, allow_negatives: false,
        session_mode: sessionMode === "seconds" ? "timed" : "fixed",
        duration_seconds: sessionMode === "seconds" ? selectedTime : null,
        question_limit: sessionMode === "questions" ? selectedTime : null,
        correct_count: correct, total_count: total,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        is_leaderboard_eligible: true, completed_at: new Date().toISOString(),
        session_answers: finalAnswers,
      })
    }
  }

  function handleAbandon() {
    setTimerActive(false); setPhase("settings")
    setAnswers([]); setCurrentQuestion(null); setTimeLeft(selectedTime)
  }

  function handleBackToSettings() {
    setPhase("settings"); setAnswers([])
    setCurrentQuestion(null); setGuestWarning(false)
  }

  function getBoxBackground() {
    if (phase === "settings") return "bg-transparent h-[400px]"
    if (phase === "results")  return "bg-foreground/30 shadow-lg py-12"
    return "bg-foreground/30 h-[400px] shadow-lg"
  }

  const pct = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

  return (
    <div className="flex flex-col items-center justify-center w-full text-text gap-6">

      {/* Navigation and Config */}
      {phase !== "playing" ? (
        <ControlBar
          selectedMode={selectedMode}       onModeChange={setSelectedMode}
          selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty}
          selectedTime={selectedTime}       onTimeChange={setSelectedTime}
          sessionMode={sessionMode}         onSessionModeChange={setSessionMode}
        />
      ) : (
        <div className="relative flex items-center justify-between w-[850px] h-[140px] px-12 py-6 rounded-2xl bg-foreground/30 shadow-lg text-[#EDE6DA] font-medium">
          <div className="flex-1 flex justify-start">
            <button onClick={handleAbandon}
              className="px-6 py-2 text-lg border-2 border-btn-background text-btn-background rounded-full hover:bg-btn-background/10 transition-all active:scale-95">
              Restart
            </button>
          </div>
          <div className={`text-5xl font-bold tracking-widest text-center drop-shadow-md transition-colors duration-300 ${
            sessionMode === "seconds" && timeLeft <= 5 ? "text-red-500" : "text-btn-background"
          }`}>
            {sessionMode === "seconds" ? `${timeLeft}` : `${totalCount + 1}/${selectedTime}`}
          </div>
          <div className="flex-1 flex justify-end">
            <button onClick={handleAbandon}
              className="px-6 py-2 text-lg border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500/10 transition-all active:scale-95">
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      <div className={`Box flex flex-col items-center justify-center w-[700px] rounded-2xl ${getBoxBackground()}`}>

        {phase === "settings" && (
          <button onClick={handleStart} disabled={isLoadingPool}
            className="px-32 py-5 -mt-32 rounded-xl bg-btn-background-hover text-3xl font-bold text-black hover:bg-btn-background transition-transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-40">
            {isLoadingPool ? "Loading..." : "Start"}
          </button>
        )}

        {phase === "playing" && currentQuestion && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full">
            <p className="Problem text-text-active text-5xl pb-14 text-center font-bold">
              {currentQuestion.question_text}
            </p>
            <input
              ref={inputRef}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)}
              type="number"
              className={`text-4xl w-60 rounded-md p-1 mb-5 text-center focus:outline-none transition-all duration-100 ${
                isCorrect === true  ? "bg-green-600 text-white" :
                isCorrect === false ? "bg-red-600 text-white"   :
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
                  <div className="w-5 h-5 rounded-md bg-[hsl(50,100%,52%)] shadow-sm" />
                  <span className="text-[#EDE6DA]">Correct: <span className="font-bold text-[hsl(50,100%,52%)]">{correctCount}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-red-500 shadow-sm" />
                  <span className="text-[#EDE6DA]">Incorrect: <span className="font-bold text-red-500">{totalCount - correctCount}</span></span>
                </div>
                <div className="text-muted text-lg mt-2 pt-2 border-t border-[#2C2920]">Total Questions: {totalCount}</div>
              </div>
            </div>

            {guestWarning && (
              <div className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 text-center">
                Your guest history is full: {" "}
                <a href="/login" className="underline font-semibold hover:text-amber-100">create an account</a>
                {" "}to save your full progress!
              </div>
            )}

            {answers.length > 0 && (
              <details className="w-full">
                <summary className="cursor-pointer text-[#C8BCAD] text-sm hover:text-[#EDE6DA] transition-colors">
                  View question breakdown ({answers.length} questions)
                </summary>
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-[#2C2920]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#211E17]">
                      <tr className="text-[#C8BCAD] text-left">
                        <th className="px-3 py-2">#</th><th className="px-3 py-2">Question</th>
                        <th className="px-3 py-2">Yours</th><th className="px-3 py-2">Answer</th>
                        <th className="px-3 py-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2920]">
                      {answers.map((a) => (
                        <tr key={a.orderInSession} className="hover:bg-[#211E17]/50">
                          <td className="px-3 py-1.5 text-[#C8BCAD]">{a.orderInSession}</td>
                          <td className="px-3 py-1.5">{a.question.question_text}</td>
                          <td className={`px-3 py-1.5 ${a.isCorrect ? "text-[hsl(50,100%,52%)]" : "text-red-400"}`}>{a.userAnswer}</td>
                          <td className="px-3 py-1.5 text-[#C8BCAD]">{a.question.correct_answer}</td>
                          <td className="px-3 py-1.5 text-right text-[#C8BCAD] text-xs">{(a.timeTakenMs / 1000).toFixed(1)}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
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
    </div>
  )
}

"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { generateLocalQuestionPool } from "@/lib/questions/arithmetic-generator"
import type { Difficulty } from "@/lib/questions/arithmetic-generator"
import type { SessionConfig, Question, QuestionSubType } from "@/lib/types/database"

// Fetch a deduplicated question pool for a session
export async function getQuestionsForSession(
  config: SessionConfig,
  difficulty: Difficulty = "Easy"
): Promise<Question[]> {
  if (process.env.NEXT_PUBLIC_MOCK_DB === "true") {
    return getFallbackQuestions(config, difficulty)
  }

  const supabase = createClient()

  // Pool size: for timed sessions fetch generously; for fixed fetch exact count
  const poolSize =
    config.sessionMode === "fixed"
      ? (config.questionLimit ?? 20)
      : Math.max(50, (config.durationSeconds ?? 60) * 2) // ~2 questions per second max

  const sortedOperatorSet = [...config.operatorSet].sort() as QuestionSubType[]

  // Check if each requested operator has at least some questions in the DB
  const { data: counts, error: countError } = await supabase
    .from("questions")
    .select("sub_type")
    .in("sub_type", sortedOperatorSet)
    .eq("has_negatives", config.allowNegatives)
    .eq("difficulty", difficulty)

  if (countError) {
    console.error("❌ DB Error checking question counts:", countError.message, countError.details)
    return []
  }

  console.log(
    `📊 DB Check: Found ${counts.length} rows matching ops: ${sortedOperatorSet.join(", ")} at difficulty: ${difficulty}`
  )

  // Ensure every requested operator is represented in the available pool
  const availableOps = new Set(
    (counts as Array<{ sub_type: QuestionSubType }>).map((q) => q.sub_type)
  )
  const missingOps = sortedOperatorSet.filter((op) => !availableOps.has(op))

  if (missingOps.length > 0) {
    console.warn(
      `Missing questions in DB for: ${missingOps.join(", ")} at ${difficulty} difficulty`
    )
    return []
  }

  const { data, error } = await supabase.rpc("get_questions_for_session", {
    p_category: config.category,
    p_operator_set: sortedOperatorSet,
    p_allow_negatives: config.allowNegatives,
    p_limit: poolSize,
    p_difficulty: difficulty
  })

  if (error || !data || data.length === 0) {
    console.warn(
      "⚠️ DB RPC get_questions_for_session returned no results:",
      error?.message || "Empty Pool"
    )
    return []
  }

  console.log(`✅ Fetched ${data.length} questions from DB for session.`)

  return data as Question[]
}

// Create a new session record (called on completion)
export async function createSession(
  config: SessionConfig,
  correctCount: number,
  totalCount: number,
  finalTime?: number,
  difficulty: string = "Easy"
): Promise<string> {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  console.log("🚀 SERVER createSession called:", { correctCount, totalCount, difficulty })

  const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0
  const sortedOperatorSet = [...config.operatorSet].sort()

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user?.id ?? null,
      category: config.category,
      operator_set: sortedOperatorSet,
      allow_negatives: config.allowNegatives,
      session_mode: config.sessionMode,
      duration_seconds: finalTime ?? config.durationSeconds ?? null,
      question_limit: config.questionLimit ?? null,
      correct_count: correctCount,
      total_count: totalCount,
      accuracy: parseFloat(accuracy.toFixed(2)),
      cqpm:
        (finalTime ?? config.durationSeconds)
          ? parseFloat(
              (correctCount / ((finalTime ?? config.durationSeconds ?? 60) / 60)).toFixed(1)
            )
          : 0,
      is_leaderboard_eligible: isLeaderboardEligible(config),
      difficulty: difficulty
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("❌ DB Error creating session:", error)
    if (error?.details) console.error("Details:", error.details)
    if (error?.hint) console.error("Hint:", error.hint)
    return "mock-session-id"
  }

  console.log("✅ Session saved successfully to DB:", data.id)

  // Compute and store percentile asynchronously (don't block the response)
  updateSessionPercentile(data.id).catch(console.error)
  revalidatePath("/attempts")

  return data.id
}

// Save answer records for a session in bulk
export async function saveSessionAnswers(
  sessionId: string,
  answers: Array<{
    questionId: string
    userAnswer: string
    isCorrect: boolean
    timeTakenMs: number
    orderInSession: number
  }>
): Promise<void> {
  if (sessionId === "mock-session-id") return

  const supabase = createClient()

  const rows = answers.map((a) => ({
    session_id: sessionId,
    question_id: a.questionId,
    user_answer: a.userAnswer,
    is_correct: a.isCorrect,
    time_taken_ms: a.timeTakenMs,
    order_in_session: a.orderInSession
  }))

  const { error } = await supabase.from("session_answers").insert(rows)

  if (error) {
    console.error("Error saving session answers:", error)
  }
}

// Internal helper to update percentile rank
async function updateSessionPercentile(sessionId: string): Promise<void> {
  const supabase = createClient()

  const { data: percentile, error } = await supabase.rpc("calculate_session_percentile", {
    p_session_id: sessionId
  })

  if (error) {
    console.error("Error calculating percentile:", error)
    return
  }

  await supabase.from("sessions").update({ percentile }).eq("id", sessionId)
}

// Retrieve session history for the authenticated user
export async function getUserSessions(): Promise<any[]> {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return getMockSessions()

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      session_answers (
        *,
        question:questions (*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50)

  if (error || !data) {
    console.error("Error fetching sessions:", error)
    return getMockSessions()
  }

  return data
}

// Check if a session's configuration is eligible for the global leaderboard
const STANDARD_PRESETS: string[][] = [
  ["addition", "division", "multiplication", "subtraction"], // all 4
  ["addition", "subtraction"], // +- only
  ["division", "multiplication"], // */ only
  ["addition"],
  ["subtraction"],
  ["multiplication"],
  ["division"]
]

function isLeaderboardEligible(config: SessionConfig): boolean {
  const sorted = [...config.operatorSet].sort().join(",")
  return STANDARD_PRESETS.some((p) => p.slice().sort().join(",") === sorted)
}

// Helpers and Mock data
function getFallbackQuestions(config: SessionConfig, difficulty: Difficulty = "Easy"): Question[] {
  // If in UI testing mode, just return bare minimum 1+1=2 questions
  if (process.env.NEXT_PUBLIC_MOCK_DB === "true") {
    const poolSize = config.sessionMode === "fixed" ? (config.questionLimit ?? 20) : 100
    return Array(poolSize)
      .fill(null)
      .map((_, i) => ({
        id: `mock-q-${i}`,
        category: "arithmetic",
        sub_type: "addition",
        operand_a: 1,
        operand_b: 1,
        operator: "+",
        question_text: "1 + 1 = ?",
        correct_answer: "2",
        has_negatives: false,
        difficulty: "Easy",
        created_at: new Date().toISOString()
      }))
  }

  // Generates a real playable pool locally — game works without any DB connection
  const poolSize =
    config.sessionMode === "fixed"
      ? (config.questionLimit ?? 20)
      : Math.max(60, (config.durationSeconds ?? 60) * 2)
  return generateLocalQuestionPool(config, poolSize, difficulty)
}

function getMockSessions(): any[] {
  return [
    {
      id: "mock-1",
      category: "arithmetic",
      operator_set: ["addition", "subtraction"],
      allow_negatives: false,
      session_mode: "timed",
      duration_seconds: 60,
      question_limit: null,
      correct_count: 12,
      total_count: 15,
      accuracy: 80,
      percentile: 72.5,
      completed_at: new Date().toISOString(),
      session_answers: []
    }
  ]
}

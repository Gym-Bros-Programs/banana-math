/**
 * lib/questions/arithmetic-generator.ts
 *
 * Client/server-safe on-the-fly question generator.
 * Used as fallback when DB is unavailable, so the UI stays fully playable.
 *
 * Difficulty ranges:
 *   Easy   : operands 1–10,  no negatives
 *   Medium : operands 1–50,  no negatives
 *   Hard   : operands 1–100, negatives allowed if config says so
 */

import type { Question, QuestionSubType, SessionConfig } from "@/lib/types/database"

export type Difficulty = "Easy" | "Medium" | "Hard"

const RANGES: Record<Difficulty, { min: number; max: number }> = {
  Easy:   { min: 1,  max: 10  },
  Medium: { min: 1,  max: 50  },
  Hard:   { min: 1,  max: 100 },
}
// Multiplication uses a narrower range to keep answers manageable
const MUL_RANGES: Record<Difficulty, { min: number; max: number }> = {
  Easy:   { min: 1, max: 10 },
  Medium: { min: 1, max: 12 },
  Hard:   { min: 1, max: 20 },
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeQ(
  subType: QuestionSubType,
  a: number, b: number,
  operator: string,
  answer: number,
  display: string,
  id: string
): Question {
  return {
    id:             `local-${subType}-${id}`,
    category:       "arithmetic",
    sub_type:       subType,
    operand_a:      a,
    operand_b:      b,
    operator,
    question_text:  display,
    correct_answer: String(answer),
    has_negatives:  a < 0 || b < 0 || answer < 0,
    difficulty:     1,
    created_at:     new Date().toISOString(),
  }
}

function applyNegative(val: number, allowNeg: boolean): number {
  return allowNeg && Math.random() < 0.4 ? -val : val
}

function generateOne(subType: QuestionSubType, difficulty: Difficulty, allowNeg: boolean): Question {
  const r   = RANGES[difficulty]
  const mr  = MUL_RANGES[difficulty]
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  switch (subType) {
    case "addition": {
      const a = applyNegative(rand(r.min, r.max), allowNeg)
      const b = applyNegative(rand(r.min, r.max), allowNeg)
      return makeQ("addition", a, b, "+", a + b, `${a} + ${b} = ?`, uid)
    }
    case "subtraction": {
      let a = rand(r.min, r.max)
      let b = rand(r.min, r.max)
      if (!allowNeg && a < b) [a, b] = [b, a] // Ensure positive result
      a = applyNegative(a, allowNeg)
      b = applyNegative(b, allowNeg)
      return makeQ("subtraction", a, b, "-", a - b, `${a} - ${b} = ?`, uid)
    }
    case "multiplication": {
      const a = applyNegative(rand(mr.min, mr.max), allowNeg)
      const b = applyNegative(rand(mr.min, mr.max), allowNeg)
      return makeQ("multiplication", a, b, "*", a * b, `${a} × ${b} = ?`, uid)
    }
    case "division": {
      // Generate (result × divisor) so the answer is always a clean integer
      const result  = rand(r.min, difficulty === "Easy" ? 10 : difficulty === "Medium" ? 20 : 50)
      const divisor = rand(1, mr.max)
      const dividend = result * divisor
      const a = applyNegative(dividend, allowNeg)
      const b = applyNegative(divisor,  allowNeg)
      return makeQ("division", a, b, "/", a / b, `${a} ÷ ${b} = ?`, uid)
    }
    default:
      return makeQ("addition", 1, 1, "+", 2, "1 + 1 = ?", uid)
  }
}

/** Shuffle in-place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Generate a pool of questions matching the session config.
 * Each call returns different random questions so re-runs feel fresh.
 */
export function generateLocalQuestionPool(
  config: SessionConfig,
  limit: number,
  difficulty: Difficulty = "Easy"
): Question[] {
  const pool: Question[] = []
  const ops = config.operatorSet

  for (let i = 0; i < limit; i++) {
    const subType = ops[i % ops.length]
    pool.push(generateOne(subType, difficulty, config.allowNegatives))
  }

  // Shuffle so it's not neatly op-op-op-op cycled
  return shuffle(pool)
}

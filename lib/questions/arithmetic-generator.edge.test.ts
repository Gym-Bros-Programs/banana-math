import { describe, expect, it } from "vitest"

import type { SessionConfig } from "@/lib/types/database"

import { generateLocalQuestionPool } from "./arithmetic-generator"

const base: SessionConfig = {
  category: "arithmetic",
  operatorSet: ["addition"],
  allowNegatives: false,
  sessionMode: "timed",
  durationSeconds: 60
}

describe("Arithmetic Generator — edge cases", () => {
  it("cycles operators evenly across pool", () => {
    const config = { ...base, operatorSet: ["addition", "subtraction"] as any }
    const pool = generateLocalQuestionPool(config, 10)
    const types = pool.map((q) => q.sub_type)
    const additions = types.filter((t) => t === "addition").length
    const subtractions = types.filter((t) => t === "subtraction").length
    expect(additions).toBe(5)
    expect(subtractions).toBe(5)
  })

  it("subtraction result is non-negative when allowNegatives is false", () => {
    const config = { ...base, operatorSet: ["subtraction"] as any }
    const pool = generateLocalQuestionPool(config, 100)
    pool.forEach((q) => {
      expect(Number(q.correct_answer)).toBeGreaterThanOrEqual(0)
    })
  })

  it("addition answer equals operand_a + operand_b", () => {
    const config = { ...base, operatorSet: ["addition"] as any }
    const pool = generateLocalQuestionPool(config, 20)
    pool.forEach((q) => {
      expect(Number(q.correct_answer)).toBe(q.operand_a! + q.operand_b!)
    })
  })

  it("subtraction answer equals operand_a - operand_b", () => {
    const config = { ...base, operatorSet: ["subtraction"] as any }
    const pool = generateLocalQuestionPool(config, 20)
    pool.forEach((q) => {
      expect(Number(q.correct_answer)).toBe(q.operand_a! - q.operand_b!)
    })
  })

  it("multiplication answer equals operand_a * operand_b", () => {
    const config = { ...base, operatorSet: ["multiplication"] as any }
    const pool = generateLocalQuestionPool(config, 20)
    pool.forEach((q) => {
      expect(Number(q.correct_answer)).toBe(q.operand_a! * q.operand_b!)
    })
  })

  it("multiplication operands respect narrower range for Easy", () => {
    const config = { ...base, operatorSet: ["multiplication"] as any }
    const pool = generateLocalQuestionPool(config, 50, "Easy")
    pool.forEach((q) => {
      expect(Math.abs(q.operand_a!)).toBeLessThanOrEqual(10)
      expect(Math.abs(q.operand_b!)).toBeLessThanOrEqual(10)
    })
  })

  it("division answer is always a clean integer", () => {
    const config = { ...base, operatorSet: ["division"] as any }
    const pool = generateLocalQuestionPool(config, 50, "Hard")
    pool.forEach((q) => {
      const answer = Number(q.correct_answer)
      expect(Number.isInteger(answer)).toBe(true)
      expect(q.operand_a! % q.operand_b!).toBe(0)
    })
  })

  it("question ids are unique across pool", () => {
    const pool = generateLocalQuestionPool(base, 50)
    const ids = pool.map((q) => q.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(50)
  })

  it("question_text contains the operator symbol", () => {
    const config = { ...base, operatorSet: ["multiplication"] as any }
    const pool = generateLocalQuestionPool(config, 5)
    pool.forEach((q) => expect(q.question_text).toContain("×"))
  })

  it("has_negatives reflects actual negative operands", () => {
    const config = { ...base, operatorSet: ["addition"] as any, allowNegatives: true }
    const pool = generateLocalQuestionPool(config, 200, "Hard")
    const withNeg = pool.filter((q) => q.has_negatives)
    withNeg.forEach((q) => {
      const hasNeg = q.operand_a! < 0 || q.operand_b! < 0 || Number(q.correct_answer) < 0
      expect(hasNeg).toBe(true)
    })
  })

  it("respects Medium difficulty range", () => {
    const config = { ...base, operatorSet: ["addition"] as any }
    const pool = generateLocalQuestionPool(config, 50, "Medium")
    pool.forEach((q) => {
      expect(Math.abs(q.operand_a!)).toBeLessThanOrEqual(50)
      expect(Math.abs(q.operand_b!)).toBeLessThanOrEqual(50)
    })
  })

  it("pool size 1 works without error", () => {
    const pool = generateLocalQuestionPool(base, 1)
    expect(pool).toHaveLength(1)
  })
})

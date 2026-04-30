import { describe, it, expect } from "vitest"
import { generateLocalQuestionPool } from "./arithmetic-generator"
import type { SessionConfig } from "@/lib/types/database"

describe("Arithmetic Generator", () => {
  const baseConfig: SessionConfig = {
    category: "arithmetic",
    operatorSet: ["addition", "subtraction"],
    allowNegatives: false,
    sessionMode: "timed",
    durationSeconds: 60
  }

  it("generates a pool of requested size", () => {
    const pool = generateLocalQuestionPool(baseConfig, 10)
    expect(pool).toHaveLength(10)
  })

  it("generates questions with requested operators", () => {
    const config: SessionConfig = { ...baseConfig, operatorSet: ["multiplication"] }
    const pool = generateLocalQuestionPool(config, 5)
    pool.forEach((q) => {
      expect(q.sub_type).toBe("multiplication")
    })
  })

  it("handles division with integer results", () => {
    const config: SessionConfig = { ...baseConfig, operatorSet: ["division"] }
    const pool = generateLocalQuestionPool(config, 20)
    pool.forEach((q) => {
      const a = q.operand_a!
      const b = q.operand_b!
      const ans = Number(q.correct_answer)
      expect(a / b).toBe(ans)
      expect(a % b).toBe(0)
    })
  })

  it("respects difficulty ranges (Easy)", () => {
    const pool = generateLocalQuestionPool(baseConfig, 50, "Easy")
    pool.forEach((q) => {
      expect(Math.abs(q.operand_a!)).toBeLessThanOrEqual(10)
      expect(Math.abs(q.operand_b!)).toBeLessThanOrEqual(10)
    })
  })

  it("respects difficulty ranges (Hard)", () => {
    const pool = generateLocalQuestionPool(baseConfig, 50, "Hard")
    // At least some should be > 50 if it's random enough
    const hasLarge = pool.some((q) => Math.abs(q.operand_a!) > 50 || Math.abs(q.operand_b!) > 50)
    expect(hasLarge).toBe(true)
  })

  it("respects allowNegatives flag", () => {
    const configNeg: SessionConfig = { ...baseConfig, allowNegatives: true }
    const configNoNeg: SessionConfig = { ...baseConfig, allowNegatives: false }

    // Test 100 questions to avoid random flake
    const poolNeg = generateLocalQuestionPool(configNeg, 100, "Hard")
    const hasNeg = poolNeg.some(
      (q) => q.operand_a! < 0 || q.operand_b! < 0 || Number(q.correct_answer) < 0
    )
    expect(hasNeg).toBe(true)

    const poolNoNeg = generateLocalQuestionPool(configNoNeg, 100, "Hard")
    const hasNoNeg = poolNoNeg.every((q) => {
      const ok = q.operand_a! >= 0 && q.operand_b! >= 0 && Number(q.correct_answer) >= 0
      if (!ok) console.log("Offending question:", q)
      return ok
    })
    expect(hasNoNeg).toBe(true)
  })
})

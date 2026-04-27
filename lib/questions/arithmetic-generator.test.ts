import { describe, it, expect } from "vitest";
import { generateLocalQuestionPool } from "./arithmetic-generator";
import type { SessionConfig } from "@/lib/types/database";

describe("arithmetic-generator", () => {
  const baseConfig: SessionConfig = {
    id: "test",
    operatorSet: ["addition", "subtraction", "multiplication", "division"],
    difficultyStr: "Easy",
    timeLimit: 60,
    allowNegatives: false,
    createdAt: new Date().toISOString(),
  };

  it("should generate the requested number of questions", () => {
    const questions = generateLocalQuestionPool(baseConfig, 5, "Easy");
    expect(questions.length).toBe(5);
  });

  it("should generate Easy questions with values between 1 and 10", () => {
    const questions = generateLocalQuestionPool(baseConfig, 50, "Easy");
    questions.forEach((q) => {
      if (q.sub_type === "division") {
        // Division operands work differently: result and divisor
        // result is up to 10 for Easy, divisor up to 10
        // dividend (a) = result * divisor (up to 100)
        expect(q.operand_b).toBeGreaterThanOrEqual(1);
        expect(q.operand_b).toBeLessThanOrEqual(10);
      } else {
        expect(q.operand_a).toBeGreaterThanOrEqual(1);
        expect(q.operand_a).toBeLessThanOrEqual(10);
        expect(q.operand_b).toBeGreaterThanOrEqual(1);
        expect(q.operand_b).toBeLessThanOrEqual(10);
      }
    });
  });

  it("should generate Medium questions with values up to 50", () => {
    const questions = generateLocalQuestionPool(baseConfig, 50, "Medium");
    questions.forEach((q) => {
      if (q.sub_type === "division") {
        expect(q.operand_b).toBeGreaterThanOrEqual(1);
        expect(q.operand_b).toBeLessThanOrEqual(12); // Medium MUL_RANGES is up to 12
      } else if (q.sub_type === "multiplication") {
        expect(q.operand_a).toBeGreaterThanOrEqual(1);
        expect(q.operand_a).toBeLessThanOrEqual(12);
        expect(q.operand_b).toBeGreaterThanOrEqual(1);
        expect(q.operand_b).toBeLessThanOrEqual(12);
      } else {
        expect(q.operand_a).toBeGreaterThanOrEqual(1);
        expect(q.operand_a).toBeLessThanOrEqual(50);
        expect(q.operand_b).toBeGreaterThanOrEqual(1);
        expect(q.operand_b).toBeLessThanOrEqual(50);
      }
    });
  });

  it("should not generate negatives when allowNegatives is false", () => {
    const config = { ...baseConfig, allowNegatives: false };
    const questions = generateLocalQuestionPool(config, 50, "Hard");
    questions.forEach((q) => {
      // Result for subtraction might be negative if a < b, but operands are positive
      // The function says a and b are positives if allowNeg is false.
      expect(q.operand_a).toBeGreaterThanOrEqual(0);
      expect(q.operand_b).toBeGreaterThanOrEqual(0);
    });
  });

  it("should allow negatives if config allows it", () => {
    const config = { ...baseConfig, allowNegatives: true };
    const questions = generateLocalQuestionPool(config, 100, "Hard");
    const hasNegativeOperand = questions.some((q) => q.operand_a < 0 || q.operand_b < 0);
    expect(hasNegativeOperand).toBe(true);
  });

  it("division questions should always result in an integer answer", () => {
    const config = { ...baseConfig, operatorSet: ["division"] as any };
    const questions = generateLocalQuestionPool(config, 20, "Medium");
    questions.forEach((q) => {
      const answer = Number(q.correct_answer);
      expect(Number.isInteger(answer)).toBe(true);
      expect(q.operand_a / q.operand_b).toBe(answer);
    });
  });
});

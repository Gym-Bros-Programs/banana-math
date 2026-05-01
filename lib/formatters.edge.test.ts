import { describe, expect, it } from "vitest"

import { formatOperatorSet, formatDate } from "./formatters"

describe("formatOperatorSet — edge cases", () => {
  it("formats all four operators", () => {
    expect(formatOperatorSet(["addition", "subtraction", "multiplication", "division"])).toBe(
      "+ − × ÷"
    )
  })

  it("formats single operators correctly", () => {
    expect(formatOperatorSet(["addition"])).toBe("+")
    expect(formatOperatorSet(["subtraction"])).toBe("−")
    expect(formatOperatorSet(["multiplication"])).toBe("×")
    expect(formatOperatorSet(["division"])).toBe("÷")
  })

  it("returns empty string for empty array", () => {
    expect(formatOperatorSet([])).toBe("")
  })

  it("handles multiplication + division combo", () => {
    expect(formatOperatorSet(["multiplication", "division"])).toBe("× ÷")
  })
})

describe("formatDate — edge cases", () => {
  it("returns input for empty string", () => {
    expect(formatDate("")).toBe("")
  })

  it("includes year for valid date", () => {
    const result = formatDate("2026-04-30T00:00:00Z")
    expect(result).toContain("2026")
  })

  it("returns input unchanged for non-date strings", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date")
    expect(formatDate("hello world")).toBe("hello world")
  })
})

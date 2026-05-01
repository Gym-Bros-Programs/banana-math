import { describe, expect, it } from "vitest"

import { isProfane } from "./profanity"

describe("isProfane", () => {
  it("returns false for empty string", () => {
    expect(isProfane("")).toBe(false)
  })

  it("returns false for clean usernames", () => {
    expect(isProfane("micsushi")).toBe(false)
    expect(isProfane("BananaKing42")).toBe(false)
    expect(isProfane("user_123")).toBe(false)
  })

  it("catches exact bad words", () => {
    expect(isProfane("fuck")).toBe(true)
    expect(isProfane("shit")).toBe(true)
    expect(isProfane("bitch")).toBe(true)
    expect(isProfane("cunt")).toBe(true)
  })

  it("catches bad words embedded in longer strings", () => {
    expect(isProfane("fuck123")).toBe(true)
    expect(isProfane("bigdick")).toBe(true)
    expect(isProfane("pussy_cat")).toBe(true)
  })

  it("is case-insensitive", () => {
    expect(isProfane("FUCK")).toBe(true)
    expect(isProfane("Shit")).toBe(true)
    expect(isProfane("BITCH")).toBe(true)
  })

  it("blocks reserved system words", () => {
    expect(isProfane("admin")).toBe(true)
    expect(isProfane("moderator")).toBe(true)
    expect(isProfane("system")).toBe(true)
    expect(isProfane("banana-math")).toBe(true)
  })

  it("blocks reserved words embedded in names", () => {
    expect(isProfane("superadmin")).toBe(true)
    expect(isProfane("Admin123")).toBe(true)
  })
})

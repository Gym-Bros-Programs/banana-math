import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

describe("login page", () => {
  it("lets Google auth buttons bypass required email and password fields", () => {
    const source = readFileSync(join(process.cwd(), "app/login/page.tsx"), "utf8")
    const googleButtonBlocks = source.match(
      /<SubmitButton\s+formAction=\{handleGoogle\}[\s\S]*?<\/SubmitButton>/g
    )

    expect(googleButtonBlocks).toHaveLength(2)
    expect(googleButtonBlocks?.every((block) => block.includes("formNoValidate"))).toBe(true)
  })

  it("wires both Google sign in and sign up buttons to the OAuth action", () => {
    const source = readFileSync(join(process.cwd(), "app/login/page.tsx"), "utf8")

    expect(source).toContain("Sign In with Google")
    expect(source).toContain("Sign Up with Google")
    expect(source.match(/formAction=\{handleGoogle\}/g)).toHaveLength(2)
  })

  it("checks signup username and email availability while filling the form", () => {
    const source = readFileSync(join(process.cwd(), "app/login/page.tsx"), "utf8")

    expect(source).toContain("<AuthAvailabilityField")
    expect(source).toContain('availabilityKind="username"')
    expect(source).toContain('availabilityKind="email"')
    expect(source).toContain("An account already exists for this email. Sign in instead.")
  })

  it("uses live password requirement feedback for signup", () => {
    const source = readFileSync(join(process.cwd(), "app/login/page.tsx"), "utf8")

    expect(source).toContain("<PasswordRequirementField")
  })
})

import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

describe("setup username page", () => {
  it("requires a username and strong password before submitting account setup", () => {
    const source = readFileSync(join(process.cwd(), "app/auth/setup-username/page.tsx"), "utf8")

    expect(source).toContain('name="username"')
    expect(source).toContain("<AuthAvailabilityField")
    expect(source).toContain('availabilityKind="username"')
    expect(source).toContain("Username is already taken.")
    expect(source).toContain("<PasswordRequirementField")
  })
})

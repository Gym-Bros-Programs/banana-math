import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

describe("PasswordRequirementField", () => {
  it("renders password requirements that turn red until fulfilled", () => {
    const source = readFileSync(
      join(process.cwd(), "components/PasswordRequirementField.tsx"),
      "utf8"
    )

    expect(source).toContain("text-red-300")
    expect(source).toContain("text-[#C8BCAD]")
    expect(source).toContain("hasMinLength")
    expect(source).toContain("hasLowerAndUpper")
    expect(source).toContain("hasNumber")
    expect(source).toContain("hasSpecial")
  })
})

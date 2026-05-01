import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

describe("AuthAvailabilityField", () => {
  it("checks availability after blur and after five seconds of no typing", () => {
    const source = readFileSync(
      join(process.cwd(), "components/AuthAvailabilityField.tsx"),
      "utf8"
    )

    expect(source).toContain("onBlur={() => void checkAvailability()}")
    expect(source).toContain("window.setTimeout")
    expect(source).toContain("5000")
    expect(source).toContain("/auth/availability?")
  })

  it("shows validation and availability messages in a side note", () => {
    const source = readFileSync(
      join(process.cwd(), "components/AuthAvailabilityField.tsx"),
      "utf8"
    )

    expect(source).toContain("absolute left-full")
    expect(source).toContain("group-focus-within:block")
    expect(source).toContain("Please enter a valid email address.")
    expect(source).toContain("type === \"email\"")
  })
})

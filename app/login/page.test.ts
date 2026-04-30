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
})

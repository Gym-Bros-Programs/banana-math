import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

const readScript = (name: string) => readFileSync(join(process.cwd(), "scripts", name), "utf8")

describe("dev start modes", () => {
  it("enables Google auth for cloud Supabase local testing", () => {
    const source = readScript("start-cloud.js")

    expect(source).toContain('NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: "true"')
    expect(source).toContain('NEXT_PUBLIC_DISABLE_GOOGLE_AUTH: "false"')
  })

  it("keeps Google auth hidden in mock UI and local DB modes", () => {
    expect(readScript("start-ui.js")).toContain('NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: "false"')
    expect(readScript("start-db.js")).toContain('NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: "false"')
  })
})

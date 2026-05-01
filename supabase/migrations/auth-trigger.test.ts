import { readFileSync } from "fs"
import { join } from "path"

import { describe, expect, it } from "vitest"

describe("auth profile trigger migration", () => {
  it("uses schema-qualified profile writes from a locked-down security definer function", () => {
    const source = readFileSync(
      join(process.cwd(), "supabase/migrations/20260501000000_fix_auth_profile_trigger.sql"),
      "utf8"
    )

    expect(source).toContain("SECURITY DEFINER")
    expect(source).toContain("SET search_path = ''")
    expect(source).toContain("INSERT INTO public.profiles")
    expect(source).toContain("FUNCTION public.handle_new_user()")
  })

  it("uses a unique placeholder username when OAuth metadata has no username yet", () => {
    const source = readFileSync(
      join(process.cwd(), "supabase/migrations/20260501000000_fix_auth_profile_trigger.sql"),
      "utf8"
    )

    expect(source).toContain("NULLIF(NEW.raw_user_meta_data->>'username', '')")
    expect(source).toContain(
      "v_username := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 19)"
    )
  })
})

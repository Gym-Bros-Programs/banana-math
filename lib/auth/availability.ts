import { createClient } from "@supabase/supabase-js"

type AvailabilityInput = {
  username?: string
  email?: string
}

type AvailabilityResult = {
  username?: { available: boolean }
  email?: { available: boolean }
}

const getServiceKey = () => {
  const appUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cloudUrl = process.env.NEXT_PUBLIC_SUPABASE_CLOUD_URL

  if (appUrl && cloudUrl && appUrl === cloudUrl && process.env.SUPABASE_SERVICE_KEY_PROD) {
    return process.env.SUPABASE_SERVICE_KEY_PROD
  }

  return process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_KEY_PROD
}

const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = getServiceKey()

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  })
}

export async function checkAuthAvailability({
  username,
  email
}: AvailabilityInput): Promise<AvailabilityResult> {
  const supabase = createAdminClient()
  const result: AvailabilityResult = {}

  if (!supabase) {
    return result
  }

  const normalizedUsername = username?.trim()
  const normalizedEmail = email?.trim().toLowerCase()

  if (normalizedUsername) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle()

    result.username = { available: !data }
  }

  if (normalizedEmail) {
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const exists =
      data?.users?.some((user) => user.email?.toLowerCase() === normalizedEmail) ?? false

    result.email = { available: !exists }
  }

  return result
}

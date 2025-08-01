import MonkeyMath from "@/components/MonkeyMath"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  // We can safely assume the user exists because the middleware protects this route.
  // We fetch the profile to greet the user.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single()

  return (
    <div className="flex-1 w-full flex flex-col items-center gap-10">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          Welcome, {profile?.full_name ?? user?.email}!
        </div>
      </div>
      <MonkeyMath />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single()

  return (
    <div className="w-full flex-1 flex flex-col py-8 font-['Inter']">
      <div className="w-full space-y-6">
        <div className="border-b border-[#2C2920] pb-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-[#EDE6DA]">Profile</h1>
          <p className="text-[#C8BCAD] mt-2">Manage your account and settings</p>
        </div>
        <div className="w-full max-w-2xl py-6 px-8 rounded-md bg-[#17150F] border border-[#2C2920] flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-[#EDE6DA]">
            {profile?.full_name ?? user?.email}
          </h2>
          <p className="text-sm text-[#C8BCAD]">Account active.</p>
        </div>
      </div>
    </div>
  )
}

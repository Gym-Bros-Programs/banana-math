import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function ProtectedPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch stats from sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("accuracy, correct_count, total_count")
    .eq("user_id", user.id)

  const totalGames = sessions?.length || 0
  const avgAccuracy = totalGames > 0 
    ? (sessions!.reduce((acc, s) => acc + Number(s.accuracy), 0) / totalGames).toFixed(1)
    : 0
  const totalCorrect = sessions?.reduce((acc, s) => acc + s.correct_count, 0) || 0

  async function updateProfile(formData: FormData) {
    "use server"
    const displayName = formData.get("display_name") as string
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id)
      revalidatePath("/protected")
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col py-8 font-['Inter']">
      <div className="w-full space-y-12">
        {/* Header */}
        <div className="border-b border-[#2C2920] pb-6 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-[#EDE6DA]">Your Profile</h1>
          <p className="text-[#C8BCAD] mt-2">Personal stats and account settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#17150F] border border-[#2C2920] flex flex-col gap-2">
            <span className="text-[#C8BCAD] text-sm uppercase font-semibold tracking-wider">Total Games</span>
            <span className="text-4xl font-bold text-[hsl(50,100%,52%)]">{totalGames}</span>
          </div>
          <div className="p-6 rounded-2xl bg-[#17150F] border border-[#2C2920] flex flex-col gap-2">
            <span className="text-[#C8BCAD] text-sm uppercase font-semibold tracking-wider">Avg Accuracy</span>
            <span className="text-4xl font-bold text-[hsl(50,100%,52%)]">{avgAccuracy}%</span>
          </div>
          <div className="p-6 rounded-2xl bg-[#17150F] border border-[#2C2920] flex flex-col gap-2">
            <span className="text-[#C8BCAD] text-sm uppercase font-semibold tracking-wider">Correct Answers</span>
            <span className="text-4xl font-bold text-[hsl(50,100%,52%)]">{totalCorrect}</span>
          </div>
        </div>

        {/* Account Details */}
        <div className="w-full space-y-6">
          <h3 className="text-2xl font-bold text-[#EDE6DA]">Account Settings</h3>
          
          <div className="p-8 rounded-2xl bg-[#17150F] border border-[#2C2920] max-w-2xl">
            <form action={updateProfile} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#C8BCAD]">Email Address</label>
                <input 
                  type="text" 
                  disabled 
                  value={user.email} 
                  className="bg-black/20 border border-[#2C2920] rounded-lg px-4 py-3 text-[#EDE6DA] opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#C8BCAD]">Display Name</label>
                <input 
                  name="display_name"
                  type="text" 
                  defaultValue={profile?.display_name || ""} 
                  placeholder="Enter your name"
                  className="bg-black/20 border border-[#2C2920] rounded-lg px-4 py-3 text-[#EDE6DA] focus:border-[hsl(50,100%,52%)] focus:outline-none transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="bg-[hsl(50,100%,52%)] hover:bg-[hsl(50,100%,60%)] text-black font-bold py-3 px-8 rounded-lg transition-all active:scale-95"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export default async function ProtectedPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Redirect to login if no authenticated session exists
  if (!session) {
    redirect("/")
  }

  // Get user profile data if needed
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-between min-h-screen bg-zinc-900">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-green-800 to-green-700 text-white py-4 px-6 text-center">
        Welcome back, {profile?.display_name || session.user.email}!
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Protected Content</h1>

        <div className="bg-zinc-800 rounded-lg p-6">
          <p className="text-zinc-200">
            This is a protected page that can only be accessed by authenticated users. You can add
            your secure content, user dashboard, or any private features here.
          </p>
        </div>

        {/* Add protected content here */}
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center text-zinc-400 text-sm">
          © 2024 Your App Name. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

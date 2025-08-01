import MonkeyMath from "@/components/MonkeyMath"
import Footer from "@/components/Footer"
import { createClient } from "@/utils/supabase/server"

import Navbar from "../components/Navbar"

export default async function Index() {
  const canInitSupabaseClient = () => {
    try {
      createClient()
      return true
    } catch (e) {
      return false
    }
  }

  const isSupabaseConnected = canInitSupabaseClient()

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-between bg-zinc-800 px-10 py-6">
      <Navbar isSupabaseConnected={isSupabaseConnected} />
      <MonkeyMath />
      <Footer />
    </div>
  )
}

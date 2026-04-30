import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Banana Math",
  description: "The fastest way to learn mental math"
}

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createClient } from "@/lib/supabase/server"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const canInitSupabaseClient = () => {
    try {
      createClient()
      return true
    } catch (_e) {
      return false
    }
  }
  const isSupabaseConnected = canInitSupabaseClient()

  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-active`}>
        <div className="min-h-screen flex flex-col w-full">
          <Navbar isSupabaseConnected={isSupabaseConnected} />
          <main className="flex-1 w-full flex flex-col px-10">{children}</main>
          <div className="w-full py-3 border-t border-[#2C2920] mt-auto bg-[#17150F]">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}

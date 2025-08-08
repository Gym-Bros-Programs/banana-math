import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "text-zinc-400 hover:text-zinc-200 transition-colors text-l p-2"

type NavbarProps = {
  isSupabaseConnected: boolean
}

export default function Navbar({ isSupabaseConnected }: NavbarProps) {
  return (
    <nav className="w-full flex items-center justify-between p-4 border-b border-zinc-800">
      <div className="flex items-center space-x-4">
        <Image
          src="/sgbanananananana.svg"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg"
          unoptimized
        />
        <span className="text-2xl font-bold text-white">Numerify</span>
        <div
          className={`w-3 h-3 rounded-full ${isSupabaseConnected ? "bg-green-500" : "bg-red-500"}`}
          title={isSupabaseConnected ? "Supabase Connected" : "Supabase Connection Failed"}
        />
      </div>
      <div className="flex items-center">
        <Link href="/protected" className={TEXT_CLASS}>
          Game
        </Link>
        <Link href="/attempts" className={TEXT_CLASS}>
          My Attempts
        </Link>
        <Link href="/leaderboard" className={TEXT_CLASS}>
          Leaderboard
        </Link>
        <AuthButton />
      </div>
    </nav>
  )
}

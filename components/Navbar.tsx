import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"
import { getSession } from "./auth/auth-utils"

const TEXT_CLASS = "text-zinc-400 hover:text-zinc-200 transition-colors text-l p-2"

export default async function Navbar({ isSupabaseConnected }: { isSupabaseConnected: boolean }) {
  const session = await getSession()

  return (
    <nav className="w-full flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Image
          src="https://placehold.co/69x69"
          alt="logo"
          width={69}
          height={69}
          className="size-10"
        />
        <span className="text-2xl font-bold">Numerify</span>
      </div>
      <div className="flex items-center">
        <Link href="/attempts" className={TEXT_CLASS}>
          Attempts
        </Link>
        <Link href="/leaderboard" className={TEXT_CLASS}>
          Leaderboard
        </Link>
        <button className={TEXT_CLASS}>Settings</button>
        {isSupabaseConnected && <AuthButton session={session} />}
      </div>
    </nav>
  )
}

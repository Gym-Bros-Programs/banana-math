import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "text-zinc-400 hover:text-zinc-200 transition-colors text-l p-2"

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between p-4 border-b border-zinc-800">
      <div className="flex items-center space-x-4">
        <Image
          src="https://placehold.co/69x69/18181b/ffffff?text=N"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <span className="text-2xl font-bold text-white">Numerify</span>
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
        {/* The AuthButton now handles all logic internally */}
        <AuthButton />
      </div>
    </nav>
  )
}

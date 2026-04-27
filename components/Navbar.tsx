import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "text-[#EDE6DA] hover:text-btn-background hover:bg-btn-background/[0.05] transition-all duration-200 text-xl font-medium px-8 py-3 rounded-md"

type NavbarProps = {
  isSupabaseConnected: boolean
}

export default function Navbar({ isSupabaseConnected }: NavbarProps) {
  return (
    <nav className="w-full flex items-center justify-between py-3 bg-transparent">
      <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
        <Image
          src="/sgbanananananana.svg"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg"
          unoptimized
        />
        <span className="text-2xl font-bold text-white">Banana Math</span>
      </Link>
      <div className="flex items-center text-2xl gap-2">
        <Link href="/" className={TEXT_CLASS}>
          Game
        </Link>
        <Link href="/attempts" className={TEXT_CLASS}>
          History
        </Link>
        <Link href="/leaderboard" className={TEXT_CLASS}>
          Leaderboard
        </Link>
        <AuthButton />
      </div>
    </nav>
  )
}

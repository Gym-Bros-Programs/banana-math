import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "text-[#EDE6DA] hover:text-btn-background hover:bg-btn-background/[0.05] transition-all duration-200 text-2xl font-bold px-8 py-3 rounded-md"

type NavbarProps = {
  isSupabaseConnected: boolean
}

export default function Navbar({ isSupabaseConnected }: NavbarProps) {
  return (
    <nav className="w-full flex items-center justify-between py-4 bg-transparent relative">
      <div className="z-10">
        <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          <Image
            src="/sgbanananananana.svg"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg"
            unoptimized
          />
          <span className="text-3xl font-black text-white">Banana Math</span>
        </Link>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/" className={TEXT_CLASS}>
            Play
          </Link>
          <Link href="/attempts" className={TEXT_CLASS}>
            History
          </Link>
          <Link href="/leaderboard" className={TEXT_CLASS}>
            Leaderboard
          </Link>
        </div>
      </div>

      <div className="z-10 flex items-center gap-2 text-2xl">
        <AuthButton />
      </div>
    </nav>
  )
}

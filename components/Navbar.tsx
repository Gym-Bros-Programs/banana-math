// components/Navbar.tsx
import Image from "next/image"
import Link from "next/link"
import React from "react"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "your-text-class" // replace with your actual class

const Navbar = ({ isSupabaseConnected }: { isSupabaseConnected: boolean }) => (
  <nav className="w-full flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Image
        src="https://placehold.co/40x40"
        alt="logo"
        width={40}
        height={40}
        className="size-10"
      />
      <span className="text-xl font-bold">BananaMath</span>
    </div>
    <div className="flex items-center space-x-4">
      <Link href="/attempts" className={TEXT_CLASS}>
        Attempts
      </Link>
      <Link href="/leaderboard" className={TEXT_CLASS}>
        Leaderboard
      </Link>
      <button className={TEXT_CLASS}>Settings</button>
      {isSupabaseConnected && <AuthButton />}
    </div>
  </nav>
)

export default Navbar

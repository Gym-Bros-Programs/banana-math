// components/Navbar.tsx
import Image from "next/image"
import Link from "next/link"

import AuthButton from "./AuthButton"

const TEXT_CLASS = "your-text-class" // replace with your actual class

const Navbar = ({ isSupabaseConnected }: { isSupabaseConnected: boolean }) => (
  <nav className="w-full flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Image
        src="https://placehold.co/69x69"
        alt="logo"
        width={69}
        height={69}
        className="size-10"
      />
      <span className="text-xl font-bold">Numerify</span>
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

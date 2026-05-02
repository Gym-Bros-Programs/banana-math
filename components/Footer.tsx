// components/Footer.tsx

import React from "react"

const Footer = () => (
  <footer className="flex w-full items-center justify-between text-sm text-muted px-8">
    <div className="flex gap-8">
      <a href="https://mail.google.com/" target="_blank">
        <button className="hover:text-btn-background transition-colors">Contact</button>
      </a>
      <a href="https://mail.google.com/" target="_blank">
        <button className="hover:text-btn-background transition-colors">Support</button>
      </a>
      <a href="https://github.com/Gym-Bros-Programs/banana-math" target="_blank">
        <button className="hover:text-btn-background transition-colors">GitHub</button>
      </a>
    </div>
    <div className="opacity-50">
      <span>v1.0.0</span>
    </div>
  </footer>
)

export default Footer

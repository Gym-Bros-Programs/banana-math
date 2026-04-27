// components/Footer.tsx

import React from "react"

const Footer = () => (
  <footer className="flex w-full items-center justify-between text-sm text-muted">
    <div className="flex space-x-8">
      <a href="https://mail.google.com/" target="_blank">
        <button>Contact</button>
      </a>
      <a href="https://mail.google.com/" target="_blank">
        <button>Support</button>
      </a>
      <a href="https://github.com/Gym-Bros-Programs/banana-math" target="_blank">
        <button>GitHub</button>
      </a>
    </div>
    <div>
      <span>v0.0.1</span>
    </div>
  </footer>
)

export default Footer

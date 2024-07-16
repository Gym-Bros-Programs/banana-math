// components/Footer.tsx

import React from 'react';

const Footer = () => (
    <footer className="mt-8 flex w-full items-center justify-between text-sm text-zinc-400">
        <div className="flex space-x-2">
            <a href="https://mail.google.com/" target="_blank">
                <button>Contact</button>
            </a>
            <a href="https://mail.google.com/" target="_blank">
                <button>Support</button>
            </a>
            <a href="https://github.com/Gym-Bros-Programs/banana-math" target="_blank">
                <button>GitHub</button>
            </a>
            <a href="https://x.com/?lang=en" target="_blank">
                <button>Twitter</button>
            </a>
        </div>
        <div>
            <span>v0.0.1</span>
        </div>
    </footer>
);

export default Footer;
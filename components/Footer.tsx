// components/Footer.tsx

import React from 'react';

const Footer = () => (
    <footer className="mt-8 flex w-full items-center justify-between text-sm text-zinc-400">
        <div className="flex space-x-2">
            <button>Contact</button>
            <button>Support</button>
            <button>GitHub</button>
            <button>Twitter</button>
        </div>
        <div>
            <span>v0.0.1</span>
        </div>
    </footer>
);

export default Footer;
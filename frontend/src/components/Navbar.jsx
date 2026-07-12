import React from 'react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-[100] bg-[#FFFDF5]/80 backdrop-blur-md border-b-2 border-border text-on-background">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a className="font-headline text-lg font-bold text-on-background flex items-center gap-2" href="#">
            <span className="bg-primary text-white w-8 h-8 rounded flex items-center justify-center font-black">T</span>
            TransitOps
          </a>
          <div className="hidden md:flex gap-6">
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#features">Features</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#platform">Platform</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#copilot">AI Copilot</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#solutions">Solutions</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#faq">FAQ</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="font-mono text-xs font-bold text-on-surface hover:underline px-4 py-2 uppercase tracking-wider">Login</button>
          <button className="candy-button px-6 py-2 rounded font-mono text-xs text-white font-bold hard-shadow uppercase tracking-wider">Launch Dashboard</button>
        </div>
      </div>
    </nav>
  );
}

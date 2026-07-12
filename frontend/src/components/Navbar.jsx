import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import logo from '../assets/favicon.png';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-[100] bg-[#FFFDF5]/80 backdrop-blur-md border-b-2 border-border text-on-background">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link className="font-headline text-lg font-bold text-on-background flex items-center gap-2" to="/">
            <img src={logo} className="w-8 h-8 object-contain rounded-lg" alt="TransitOps" />
            TransitOps
          </Link>
          <div className="hidden md:flex gap-6">
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="/#features">Features</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="/#platform">Platform</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="/#copilot">AI Copilot</a>
            <a className="font-mono text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="/#faq">FAQ</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="font-mono text-xs font-bold text-on-surface hover:underline px-4 py-2 uppercase tracking-wider cursor-pointer"
              >
                Logout
              </button>
              <Link 
                to="/console" 
                className="candy-button px-6 py-2 rounded font-mono text-xs text-white font-bold hard-shadow uppercase tracking-wider"
              >
                Console
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="font-mono text-xs font-bold text-on-surface hover:underline px-4 py-2 uppercase tracking-wider"
              >
                Login
              </Link>
              <Link 
                to="/console"
                className="candy-button px-6 py-2 rounded font-mono text-xs text-white font-bold hard-shadow uppercase tracking-wider"
              >
                Launch Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

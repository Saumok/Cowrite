'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CinematicLandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthenticated(!!token);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundColor: 'hsl(201, 100%, 13%)', // Deep navy blue
        fontFamily: "'Inter', sans-serif",
        color: '#ffffff',
      }}
    >
      {/* Fullscreen Cinematic Looping Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
        style={{ filter: 'brightness(0.6)' }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay to ensure beautiful contrast */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none select-none"
        style={{
          background: 'linear-gradient(180deg, rgba(20, 24, 33, 0.4) 0%, rgba(13, 20, 29, 0.7) 100%)',
        }}
      />

      {/* Glassmorphic Navigation Bar */}
      <nav 
        className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between"
        style={{ zIndex: 10 }}
      >
        {/* Brand Logo */}
        <div 
          className="text-3xl tracking-tight text-white select-none cursor-pointer flex items-center"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <Link href="/">
            Cowrite<sup className="text-xs ml-0.5" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>®</sup>
          </Link>
        </div>

        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors"
            style={{ color: '#ffffff' }}
          >
            Home
          </Link>
          <a 
            href="#" 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'hsl(240, 4%, 66%)' }}
          >
            Studio
          </a>
          <a 
            href="#" 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'hsl(240, 4%, 66%)' }}
          >
            About
          </a>
          <a 
            href="#" 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'hsl(240, 4%, 66%)' }}
          >
            Journal
          </a>
          <a 
            href="#" 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'hsl(240, 4%, 66%)' }}
          >
            Reach Us
          </a>
        </div>

        {/* CTA Button */}
        <div>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
            >
              Go to Workspace
            </Link>
          ) : (
            <Link
              href="/login"
              className="liquid-glass rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
            >
              Begin Journey
            </Link>
          )}
        </div>
      </nav>

      {/* Cinematic Centered Hero Section */}
      <main 
        className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center pt-24 pb-32"
        style={{ zIndex: 10 }}
      >
        {/* Animated Title */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl tracking-[-2.46px] max-w-7xl font-normal leading-[0.95] animate-fade-rise text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where thoughts <em className="not-italic" style={{ color: 'hsl(240, 4%, 66%)' }}>rise</em> <br />
          <em className="not-italic" style={{ color: 'hsl(240, 4%, 66%)' }}>through the silence.</em>
        </h1>

        {/* Animated Subtext */}
        <p
          className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay"
          style={{ color: 'hsl(240, 4%, 66%)' }}
        >
          We're designing tools for deep thinkers, bold creators, and quiet rebels.
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        {/* Animated Action CTA Button */}
        <div className="animate-fade-rise-delay-2 mt-12">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
              style={{ letterSpacing: '0.03em' }}
            >
              Enter Workspace
            </Link>
          ) : (
            <Link
              href="/signup"
              className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
              style={{ letterSpacing: '0.03em' }}
            >
              Begin Journey
            </Link>
          )}
        </div>
      </main>

      {/* Cinematic Minimal Footer */}
      <footer 
        className="relative z-10 w-full text-center py-8 text-[11px] select-none tracking-widest uppercase"
        style={{ 
          zIndex: 10,
          color: 'rgba(255, 255, 255, 0.35)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <p>© 2026 Cowrite. Where words echo in the stillness.</p>
      </footer>
    </div>
  );
}

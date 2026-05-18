'use client';

// Trigger commit to force Vercel to redeploy the cinematic landing page
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CinematicLandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthenticated(!!token);

    // Dynamic intersection observer to update active nav tab on scroll
    const handleScroll = () => {
      const sections = ['home', 'studio', 'about', 'journal', 'reach'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(`section-${section}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 3000);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundColor: '#0D141D', // Brightened deep navy base
        fontFamily: "'Inter', sans-serif",
        color: '#ffffff',
      }}
    >
      {/* =========================================
         HERO SECTION / HOME
         ========================================= */}
      <section 
        id="section-home" 
        className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden"
      >
        {/* Fullscreen Looping Video Background (Lighter and More Vibrant) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          style={{ filter: 'brightness(0.9)' }} // Brightened video from 0.6 to 0.9 for vivid imagery
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dynamic Soft Overlay to protect contrast while staying bright */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(13, 20, 29, 0.15) 0%, rgba(13, 20, 29, 0.45) 100%)',
          }}
        />

        {/* Glassmorphic Navigation Bar */}
        <nav 
          className="sticky top-0 w-full px-8 py-6 flex items-center justify-between z-50 backdrop-blur-md"
          style={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(13, 20, 29, 0.55)'
          }}
        >
          {/* Logo with pen icon */}
          <div 
            className="text-3xl tracking-tight text-white select-none cursor-pointer flex items-center gap-3"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            onClick={() => scrollToSection('home')}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path
                d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"
                stroke="var(--color-accent, #C4785A)" // Signature terracotta pen logo outline
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="16" y1="8" x2="2" y2="22"
                stroke="var(--color-accent, #C4785A)"
                strokeWidth="2.2"
              />
            </svg>
            <span className="hover:opacity-90 transition-opacity">
              Cowrite<sup className="text-[10px] ml-0.5 font-sans font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>®</sup>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'studio', label: 'Studio' },
              { id: 'about', label: 'About' },
              { id: 'journal', label: 'Journal' },
              { id: 'reach', label: 'Reach Us' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="text-sm font-medium transition-all duration-300 cursor-pointer outline-none relative py-1"
                style={{ 
                  color: activeSection === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                }}
              >
                {tab.label}
                {activeSection === tab.id && (
                  <span 
                    className="absolute bottom-0 left-0 w-full h-[2px] rounded-full"
                    style={{ background: 'var(--color-accent, #C4785A)' }}
                  />
                )}
              </button>
            ))}
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

        {/* Centered Hero Main */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center my-auto pt-16 pb-24">
          <h1
            className="text-5xl sm:text-7xl md:text-8xl tracking-[-2.46px] max-w-7xl font-normal leading-[0.92] animate-fade-rise"
            style={{ 
              fontFamily: "'Instrument Serif', serif", 
              color: '#ffffff', // High contrast white
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}
          >
            Where thoughts <em className="not-italic italic" style={{ color: '#F4A96A' }}>rise</em> <br />
            <em className="not-italic" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>through the silence.</em>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay"
            style={{ color: 'rgba(255, 255, 255, 0.75)', textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}
          >
            We're designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <div className="animate-fade-rise-delay-2 mt-10">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
                style={{ letterSpacing: '0.03em', boxShadow: '0 4px 24px rgba(196, 120, 90, 0.25)' }}
              >
                Enter Workspace
              </Link>
            ) : (
              <Link
                href="/signup"
                className="liquid-glass rounded-full px-14 py-5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] inline-block text-center cursor-pointer"
                style={{ letterSpacing: '0.03em', boxShadow: '0 4px 24px rgba(196, 120, 90, 0.25)' }}
              >
                Begin Journey
              </Link>
            )}
          </div>
        </main>

        <div className="w-full text-center py-6 text-[11px] tracking-widest uppercase select-none opacity-40">
          Scroll to explore the studio
        </div>
      </section>

      {/* =========================================
         STUDIO SECTION
         ========================================= */}
      <section 
        id="section-studio" 
        className="w-full py-32 px-8 flex flex-col items-center justify-center relative border-t border-[rgba(255,255,255,0.06)]"
        style={{ background: 'linear-gradient(180deg, #0D141D 0%, #080D14 100%)' }}
      >
        <div className="max-w-6xl w-full flex flex-col items-center select-none">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent, #C4785A)' }}>
              THE WRITING SPACE
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-4" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Exquisite, Focus-Driven Design
            </h2>
            <p className="max-w-xl text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              A distraction-free collaborative digital sheet styled like high-quality hot-pressed cotton paper.
            </p>
          </div>

          {/* Interactive Workspace Mockup */}
          <div 
            className="w-full max-w-4xl rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            style={{ 
              background: '#FDFAF6', // Physical warm paper
              border: '1px solid rgba(196, 181, 173, 0.3)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Mock Header Tabs */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 border-[rgba(196,181,173,0.2)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 opacity-60" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-60" />
                <span className="w-3 h-3 rounded-full bg-green-400 opacity-60" />
              </div>
              <div className="text-[12px] font-medium font-sans uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent, #C4785A)' }}>
                Collaborative Journal.md
              </div>
              <div className="w-8 h-8 rounded-full bg-[rgba(196,181,173,0.15)] flex items-center justify-center text-[10px] text-gray-500 font-bold">
                2P
              </div>
            </div>

            {/* Note Editor Area Mockup */}
            <div className="px-4 py-2 text-left" style={{ color: '#2C2420' }}>
              <h3 className="text-3xl font-normal italic mb-6" style={{ fontFamily: "'Instrument Serif', serif", color: '#2C2420' }}>
                The Art of Slow Writing
              </h3>
              
              <div className="space-y-4 font-sans text-[14.5px] leading-relaxed select-none" style={{ color: '#4A3F38' }}>
                <p className="relative">
                  Writing is the conversation that our thoughts have on paper. When we co-write, we align our heartbeats across distance, turning static words into dynamic expressions.
                  <span className="inline-block w-[2px] h-[17px] bg-[var(--color-accent, #C4785A)] ml-1 animate-pulse" />
                </p>
                
                <p className="relative pl-0.5">
                  <span 
                    className="absolute -top-4 left-32 px-1.5 py-0.5 rounded text-[10px] text-white font-medium select-none"
                    style={{ background: 'var(--color-accent, #C4785A)' }}
                  >
                    Shivam
                  </span>
                  Here in the quiet, ideas take form. We block out the noise of modern algorithms to construct something quiet, meaningful, and enduring.
                  <span className="absolute bottom-0 left-[225px] w-[2px] h-[17px]" style={{ background: 'var(--color-accent, #C4785A)' }} />
                </p>
              </div>
            </div>

            {/* Liquid Ambient blobs reflected inside paper */}
            <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full opacity-10 pointer-events-none" style={{ background: 'var(--color-accent, #C4785A)', filter: 'blur(30px)' }} />
          </div>
        </div>
      </section>

      {/* =========================================
         ABOUT SECTION — Liquid Glass Feature Cards
         ========================================= */}
      <section
        id="section-about"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: '#080D14' }}
      >
        {/* Ambient blob */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(196,120,90,0.05)', filter: 'blur(120px)' }} />

        <div className="max-w-6xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-20 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              OUR MANIFESTO
            </span>
            <h2 className="text-4xl sm:text-6xl font-normal mt-5 leading-tight" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Blending ink, paper,{' '}
              <em className="not-italic" style={{ color: '#F4A96A' }}>and liquid glass.</em>
            </h2>
            <p className="max-w-2xl mx-auto text-[15px] leading-relaxed mt-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              We believe digital interfaces shouldn't be cold and industrial. Cowrite captures the warm tactile weight of leather-bound notebooks, typewriter spools, and cotton fibers — merged into a high-performance, real-time collaboration canvas.
            </p>
          </div>

          {/* 3-column glass feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                ),
                label: 'Tactile Layering',
                body: 'Rich shadow maps, warm paper textures, and terracotta border highlights that respond instantly to your focus.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A8C4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ),
                label: 'Sub-Millisecond Sync',
                body: 'Socket.IO channels push every keystroke in real time. Co-authoring feels as natural as speaking in the same room.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A8D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                label: 'Privacy First',
                body: 'Your notes are yours. Role-based access, granular sharing controls, and zero tracking by default.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group relative p-7 rounded-3xl cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)',
                  transition: 'all 300ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(196,120,90,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)';
                }}
              >
                {/* Glass shimmer top line */}
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'rgba(255,255,255,0.14)', borderRadius: '999px' }} />
                <div className="mb-5 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {card.icon}
                </div>
                <h4 className="text-[17px] font-medium mb-3 select-none" style={{ color: '#ffffff', fontFamily: "'Instrument Serif', serif" }}>
                  {card.label}
                </h4>
                <p className="text-[13.5px] leading-relaxed select-none" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
         JOURNAL SECTION — Premium Quote Cards
         ========================================= */}
      <section
        id="section-journal"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: 'linear-gradient(180deg, #080D14 0%, #0D141D 100%)' }}
      >
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(168,192,214,0.05)', filter: 'blur(100px)' }} />

        <div className="max-w-5xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-16 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              THE COMMUNITY
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-5" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Echoes in the Stillness
            </h2>
            <p className="max-w-md mx-auto text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Quiet notes, poetry, and journals from the Cowrite community.
            </p>
          </div>

          {/* 2-column quote cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: '"A quiet room, a glowing screen, and minds aligned perfectly across distance. We spoke without talking — writing our dreams onto the digital paper."',
                meta: 'Journal Entry #42',
                author: 'Anonymous',
                accent: '#F4A96A',
              },
              {
                quote: '"Distractions fade into empty space, thoughts gather their natural shape, and suddenly writing becomes breathing again. This is exactly where I belong."',
                meta: 'Studio Entry #109',
                author: 'Elena K.',
                accent: '#A8C4B8',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative p-8 rounded-3xl flex flex-col justify-between group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
                  transition: 'all 320ms ease',
                  minHeight: '220px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = `${item.accent}33`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top shimmer */}
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px' }} />
                {/* Accent left strip */}
                <div style={{ position: 'absolute', top: '24px', bottom: '24px', left: 0, width: '3px', background: item.accent, borderRadius: '0 3px 3px 0', opacity: 0.7 }} />

                {/* Large open-quote glyph */}
                <div className="mb-4 select-none" style={{ fontSize: '56px', lineHeight: 1, color: item.accent, opacity: 0.25, fontFamily: "'Instrument Serif', serif" }}>
                  "
                </div>

                <p className="text-[16px] leading-[1.75] select-none" style={{ fontFamily: "'Instrument Serif', serif", color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
                  {item.quote}
                </p>

                <div className="flex items-center gap-2.5 mt-7 select-none">
                  <span className="w-5 h-[1px]" style={{ background: item.accent, opacity: 0.6 }} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {item.meta} · {item.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
         REACH US SECTION — Premium Glass Form
         ========================================= */}
      <section
        id="section-reach"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: '#0D141D' }}
      >
        <div className="absolute top-0 right-1/3 w-[350px] h-[350px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(196,120,90,0.06)', filter: 'blur(90px)' }} />

        <div className="max-w-lg w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-12 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              CONTACT US
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-5 mb-3" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Begin the Conversation
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Have a question, feedback, or a collaborative idea? Drop us a line.
            </p>
          </div>

          {/* Glass form card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)',
              padding: '40px 36px',
            }}
          >
            {/* Top shimmer */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,0.18)', borderRadius: '999px' }} />

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(196,120,90,0.15)', border: '1px solid rgba(196,120,90,0.30)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4785A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-[20px] font-medium mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>Message Sent</h4>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Thank you. We'll reach out to you through the silence.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                {[
                  { id: 'form-name', label: 'Name', type: 'text', value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), placeholder: 'Your name' },
                  { id: 'form-email', label: 'Email', type: 'email', value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), placeholder: 'you@example.com' },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-[11px] font-semibold uppercase tracking-[0.10em] mb-2 select-none" style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        color: '#ffffff',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(196,120,90,0.55)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="form-message" className="block text-[11px] font-semibold uppercase tracking-[0.10em] mb-2 select-none" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Message
                  </label>
                  <textarea
                    id="form-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none transition-all duration-200 resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(196,120,90,0.55)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-medium text-white transition-all duration-300 cursor-pointer mt-1 select-none"
                  style={{
                    background: 'linear-gradient(135deg, #C4785A, #B85C3A)',
                    border: 'none',
                    fontSize: '15px',
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 20px rgba(196,120,90,0.30), inset 0 1px 0 rgba(255,255,255,0.20)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(196,120,90,0.40), inset 0 1px 0 rgba(255,255,255,0.20)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(196,120,90,0.30), inset 0 1px 0 rgba(255,255,255,0.20)';
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full py-10 border-t border-[rgba(255,255,255,0.06)] select-none"
        style={{ background: '#080D14' }}
      >
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4785A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            <span className="text-[12px] font-medium" style={{ fontFamily: "'Instrument Serif', serif", color: 'rgba(255,255,255,0.45)' }}>
              Cowrite
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}>
            © 2026 · Where words echo in the stillness.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'GitHub'].map((l) => (
              <a key={l} href="#" className="text-[11px] uppercase tracking-wider transition-colors" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#C4785A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
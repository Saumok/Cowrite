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
         ABOUT SECTION — 6 feature cards in 2×3 grid
         ========================================= */}
      <section
        id="section-about"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: '#080D14' }}
      >
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(196,120,90,0.05)', filter: 'blur(120px)' }} />

        <div className="max-w-6xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-16 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              WHY COWRITE
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-4 leading-tight" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Built for real collaboration,{' '}
              <em className="not-italic" style={{ color: '#F4A96A' }}>not compromise.</em>
            </h2>
            <p className="max-w-xl mx-auto text-[14px] leading-relaxed mt-5" style={{ color: 'rgba(255,255,255,0.50)', textAlign: 'center' }}>
              Cowrite combines a Socket.IO real-time engine with a warm liquid glass interface — so working together feels as natural as writing in the same room.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: '<100ms', label: 'Socket Latency' },
              { value: '≥3', label: 'Live Collaborators' },
              { value: 'JWT', label: 'Secure Auth' },
              { value: '2s', label: 'Auto-save Debounce' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-5 px-4 rounded-2xl select-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-semibold mb-1" style={{ fontFamily: "'Instrument Serif', serif", color: '#F4A96A' }}>{stat.value}</div>
                <div className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 2×3 glass feature cards — short text, no overflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                stroke: '#F4A96A',
                icon: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>,
                label: 'Real-Time Editing',
                body: 'Every keystroke syncs instantly via Socket.IO rooms. No page refresh — just fluid, live co-authoring.',
              },
              {
                stroke: '#A8C4B8',
                icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
                label: 'Granular Sharing',
                body: 'Share any note as Viewer (read-only) or Editor. Owners manage collaborators from the Share Modal.',
              },
              {
                stroke: '#C9A8D4',
                icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
                label: 'JWT Security',
                body: 'Every REST call and Socket.IO connection is guarded by signed JWT tokens. Your notes stay private.',
              },
              {
                stroke: '#8BB8D4',
                icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
                label: 'Auto-Save',
                body: 'A 2-second debounce auto-saves content to the database. No manual save button needed.',
              },
              {
                stroke: '#D4A8A8',
                icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
                label: 'Search & Filter',
                body: 'Instantly search across note titles and content. Toggle between your notes and shared notes.',
              },
              {
                stroke: '#A8D4C4',
                icon: <><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
                label: 'Smart Dashboard',
                body: 'Note cards show title, last-updated time, and collaborator count. Archive, search, and create with one click.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="relative p-6 rounded-3xl cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  boxShadow: '0 6px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.11)',
                  transition: 'all 280ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                  e.currentTarget.style.borderColor = `${card.stroke}44`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.30), 0 0 0 1px ${card.stroke}22, inset 0 1px 0 rgba(255,255,255,0.16)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.11)';
                }}
              >
                {/* Shimmer top */}
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'rgba(255,255,255,0.13)', borderRadius: '999px' }} />

                <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${card.stroke}33` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={card.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {card.icon}
                  </svg>
                </div>

                <h4 className="text-[15px] font-semibold mb-2 select-none" style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
                  {card.label}
                </h4>
                <p className="text-[13px] leading-[1.65] select-none" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
         JOURNAL SECTION — Quote Cards
         ========================================= */}
      <section
        id="section-journal"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: 'linear-gradient(180deg, #080D14 0%, #0D141D 100%)' }}
      >
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(168,192,214,0.05)', filter: 'blur(100px)' }} />

        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-14 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              FROM THE COMMUNITY
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-4" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Echoes in the Stillness
            </h2>
            <p className="max-w-sm mx-auto text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Voices from Cowrite users who found their flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: 'A quiet room, a glowing screen, and minds aligned across distance. We spoke without talking — writing our shared notes onto the same digital page in real time.',
                meta: 'Student Collaborator',
                author: 'Anonymous',
                accent: '#F4A96A',
              },
              {
                quote: 'Distractions fade, thoughts gather their shape, and suddenly writing becomes breathing again. The live sync is so smooth I forget we\'re not in the same room.',
                meta: 'Remote Team Member',
                author: 'Elena K.',
                accent: '#A8C4B8',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative pl-10 pr-8 py-8 rounded-3xl flex flex-col"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.11)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.11)',
                  transition: 'all 300ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.borderColor = `${item.accent}44`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Accent left strip */}
                <div style={{ position: 'absolute', top: '24px', bottom: '24px', left: 0, width: '3px', background: item.accent, borderRadius: '0 3px 3px 0', opacity: 0.7 }} />

                {/* Compact quote mark */}
                <div className="mb-3 select-none" style={{ color: item.accent, opacity: 0.5, fontSize: '26px', lineHeight: 1, fontFamily: "'Instrument Serif', serif" }}>
                  &#8220;
                </div>

                <p className="text-[15px] leading-[1.8] select-none" style={{ fontFamily: "'Instrument Serif', serif", color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
                  {item.quote}
                </p>

                <div className="flex items-center gap-2.5 mt-5 select-none">
                  <span className="w-5 h-[1px]" style={{ background: item.accent, opacity: 0.55 }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {item.meta} · {item.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
         REACH US SECTION — Glass Contact Form
         ========================================= */}
      <section
        id="section-reach"
        className="w-full py-28 px-6 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)] relative"
        style={{ background: '#0D141D' }}
      >
        <div className="absolute top-0 right-1/3 w-[350px] h-[350px] rounded-full pointer-events-none select-none" style={{ background: 'rgba(196,120,90,0.06)', filter: 'blur(90px)' }} />

        <div className="max-w-lg w-full relative z-10">
          <div className="text-center mb-10 select-none">
            <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4785A' }}>
              GET IN TOUCH
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-4 mb-3" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
              Begin the Conversation
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Questions, feedback, or a collaboration idea? We read everything.
            </p>
          </div>

          {/* Glass form card */}
          <div
            className="relative rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.16)',
              padding: '40px 36px 44px',
            }}
          >
            {/* Shimmer top */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,0.20)', borderRadius: '999px' }} />

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(196,120,90,0.15)', border: '1px solid rgba(196,120,90,0.30)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4785A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-[20px] font-medium mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>Message Sent</h4>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Thank you. We&apos;ll reach out through the silence.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                {[
                  { id: 'form-name', label: 'Name', type: 'text', value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), placeholder: 'Your name' },
                  { id: 'form-email', label: 'Email', type: 'email', value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), placeholder: 'you@example.com' },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 select-none" style={{ color: 'rgba(255,255,255,0.38)' }}>
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
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(196,120,90,0.55)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="form-message" className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 select-none" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Message
                  </label>
                  <textarea
                    id="form-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts, ideas, or feedback..."
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none transition-all duration-200 resize-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(196,120,90,0.55)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 cursor-pointer select-none"
                  style={{
                    background: 'linear-gradient(135deg, #C4785A 0%, #B05238 100%)',
                    border: 'none',
                    fontSize: '14px',
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 20px rgba(196,120,90,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 32px rgba(196,120,90,0.44), inset 0 1px 0 rgba(255,255,255,0.22)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(196,120,90,0.32), inset 0 1px 0 rgba(255,255,255,0.22)';
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
            <span className="text-[13px] font-medium" style={{ fontFamily: "'Instrument Serif', serif", color: 'rgba(255,255,255,0.40)' }}>
              Cowrite
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: "'Inter', sans-serif" }}>
            © 2026 · Built by Saumok Kundu · LHCPL-SE-2026-3429
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'GitHub'].map((l) => (
              <a key={l} href="#" className="text-[11px] uppercase tracking-wider transition-colors" style={{ color: 'rgba(255,255,255,0.22)', fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#C4785A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
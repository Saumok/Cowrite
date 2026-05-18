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
            <h2 className="text-4xl sm:text-5xl font-normal mt-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
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
         ABOUT SECTION
         ========================================= */}
      <section 
        id="section-about" 
        className="w-full py-32 px-8 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)]"
        style={{ background: '#080D14' }}
      >
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center select-none">
          {/* Manifesto Left */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent, #C4785A)' }}>
              OUR MANIFESTO
            </span>
            <h2 className="text-4xl sm:text-6xl font-normal mt-4 leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Blending ink, paper, <br />
              <em className="not-italic" style={{ color: '#F4A96A' }}>and liquid glass.</em>
            </h2>
            <p className="text-[14px] leading-relaxed mt-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              We believe digital interfaces shouldn't be cold and industrial. Cowrite was born to capture the warm tactile weight of leather-bound booklets, typewriter ink spools, and heavy cotton fibers, merging them seamlessly into a high-performance, real-time collaboration canvas.
            </p>
          </div>

          {/* Details Cards Right */}
          <div className="space-y-6">
            <div 
              className="p-6 rounded-2xl border" 
              style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <h4 className="text-[18px] font-medium text-white mb-2">Tactile Layering</h4>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Rich shadow maps, warm paper texture surfaces, and gold-terracotta border highlights that respond instantly to your mouse focus.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl border" 
              style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <h4 className="text-[18px] font-medium text-white mb-2">Sub-Millisecond Sync</h4>
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Powered by high-performance Socket.IO channels, co-authoring note entries happens instantly with zero delay, locking paragraphs safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
         JOURNAL SECTION
         ========================================= */}
      <section 
        id="section-journal" 
        className="w-full py-32 px-8 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)]"
        style={{ background: 'linear-gradient(180deg, #080D14 0%, #0D141D 100%)' }}
      >
        <div className="max-w-6xl w-full select-none">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent, #C4785A)' }}>
              THE COMMUNITY
            </span>
            <h2 className="text-4xl sm:text-5xl font-normal mt-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Echoes in the Stillness
            </h2>
            <p className="max-w-xl mx-auto text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Read the quiet notes, poetry, and journals crafted by quiet thinkers using Cowrite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Note 1 */}
            <div className="liquid-glass p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div>
                <p className="text-[18px] leading-relaxed italic" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
                  "A quiet room, a glowing laptop screen, and minds aligned perfectly in the cloud. We spoke without talking, writing our dreams onto the digital paper."
                </p>
                <div className="flex items-center gap-2 mt-6 select-none">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent, #C4785A)' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    Journal Entry #42 • Anonymous
                  </span>
                </div>
              </div>
            </div>

            {/* Note 2 */}
            <div className="liquid-glass p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div>
                <p className="text-[18px] leading-relaxed italic" style={{ fontFamily: "'Instrument Serif', serif", color: '#ffffff' }}>
                  "Distractions fade into empty space, thoughts gather their natural shape, and suddenly writing becomes breathing again. This is exactly where I belong."
                </p>
                <div className="flex items-center gap-2 mt-6 select-none">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent, #C4785A)' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    Studio Entry #109 • Elena K.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
         REACH US SECTION
         ========================================= */}
      <section 
        id="section-reach" 
        className="w-full py-32 px-8 flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.06)]"
        style={{ background: '#0D141D' }}
      >
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent, #C4785A)' }}>
            CONTACT US
          </span>
          <h2 className="text-4xl sm:text-5xl font-normal mt-4 mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Begin the Conversation
          </h2>
          <p className="text-[13.5px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Have a question, feedback, or a collaborative idea? Drop us a line.
          </p>

          {isSubmitted ? (
            <div 
              className="w-full p-8 rounded-2xl liquid-glass border flex flex-col items-center justify-center"
              style={{ borderColor: 'var(--color-accent, #C4785A)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #C4785A)" strokeWidth="2" className="mb-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <h4 className="text-[18px] font-medium mb-1">Message Sent</h4>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Thank you! We'll reach out to you through the silence.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 select-none" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(255,255,255,0.03)] border outline-none text-white transition-all focus:border-[var(--color-accent,#C4785A)]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 select-none" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(255,255,255,0.03)] border outline-none text-white transition-all focus:border-[var(--color-accent,#C4785A)]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 select-none" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 rounded-lg text-sm bg-[rgba(255,255,255,0.03)] border outline-none text-white transition-all focus:border-[var(--color-accent,#C4785A)] resize-none"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              <button
                type="submit"
                className="w-full liquid-glass rounded-full py-3.5 mt-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(196, 120, 90, 0.15)' }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Cinematic Minimal Footer */}
      <footer 
        className="w-full text-center py-10 text-[11px] select-none tracking-widest uppercase border-t border-[rgba(255,255,255,0.06)]"
        style={{ 
          color: 'rgba(255, 255, 255, 0.35)',
          background: '#0D141D',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <p>© 2026 Cowrite. Where words echo in the stillness.</p>
      </footer>
    </div>
  );
}

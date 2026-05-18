'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', { id: 'password-short-error' });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/signup', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Deduplicated signup toast
      toast.success('Account created successfully!', { id: 'auth-success' });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed', { id: 'auth-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col align-items justify-center items-center relative overflow-hidden"
      style={{
        background: 'var(--color-canvas)',
        padding: '40px 20px',
      }}
    >
      {/* Dynamic Warm Blobs */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Blob 1 (top-right) */}
        <div style={{
          position: 'fixed',
          width: '520px', height: '520px',
          top: '-130px', right: '-100px',
          background: 'var(--blob-orange)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.32,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        
        {/* Blob 2 (bottom-left) */}
        <div style={{
          position: 'fixed',
          width: '420px', height: '420px',
          bottom: '-100px', left: '-80px',
          background: 'var(--blob-blush)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: 0.28,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      </div>

      {/* 1. Logo ABOVE card */}
      <div 
        className="flex items-center justify-center gap-2.5 mb-8 select-none relative"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          color: 'var(--color-text-heading)',
          zIndex: 1,
        }}
      >
        {/* SVG pen icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path 
            d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" 
            stroke="var(--color-text-heading)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <line 
            x1="16" 
            y1="8" 
            x2="2" 
            y2="22" 
            stroke="var(--color-text-heading)" 
            strokeWidth="2.2"
          />
        </svg>

        {/* "Cowrite" display name */}
        <span>Cowrite</span>
      </div>

      {/* 2. Card container */}
      <div 
        className="glass-panel w-full max-w-[440px] page-enter relative"
        style={{
          padding: '52px 44px',
          zIndex: 1,
        }}
      >
        {/* Heading */}
        <h2 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--color-text-heading)',
            marginBottom: '8px',
          }}
        >
          Create Account
        </h2>

        {/* Subtext */}
        <p 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
          }}
        >
          Start your creative journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Name input field */}
          <Input
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            containerStyle={{ marginBottom: '24px' }}
          />

          {/* Email input field */}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            containerStyle={{ marginBottom: '24px' }}
          />

          {/* Password input field */}
          <div className="flex flex-col" style={{ marginBottom: '16px' }}>
            <label className="block font-sans text-[13px] font-semibold tracking-[0.06em] text-[var(--color-text-secondary)] uppercase mb-2 select-none">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[18px] py-[14px] font-sans text-[15px] text-[var(--color-text-body)] shadow-[var(--shadow-inset)] outline-none [appearance:none] [-webkit-appearance:none] transition-all duration-[180ms] ease-in-out focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_4px_var(--color-accent-glass),var(--shadow-inset)] focus:bg-[rgba(255,252,248,0.92)] placeholder:text-[var(--color-text-muted)] pr-12"
              />
              {/* Show/Hide eye button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors select-none border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mb-10 font-sans select-none">
            At least 6 characters
          </p>

          {/* Sign Up Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full !h-[52px] !rounded-[var(--radius-md)] !text-[16px] font-medium justify-center select-none"
            style={{ fontWeight: 500 }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '36px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        {/* Login Link */}
        <div className="text-center font-sans text-[14px] text-[var(--color-text-secondary)] select-none">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--color-accent)] font-medium hover:underline hover:text-[var(--color-accent-hover)] transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

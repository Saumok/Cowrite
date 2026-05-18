'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back!', { id: 'auth-success' });
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed', { id: 'auth-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-canvas)', padding: '40px 20px' }}
    >
      {/* Ambient blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'fixed', width: '500px', height: '500px',
          top: '-120px', right: '-80px',
          background: 'var(--blob-orange)', borderRadius: '50%',
          filter: 'blur(110px)', opacity: 0.28,
        }} />
        <div style={{
          position: 'fixed', width: '400px', height: '400px',
          bottom: '-80px', left: '-60px',
          background: 'var(--blob-blush)', borderRadius: '50%',
          filter: 'blur(95px)', opacity: 0.24,
        }} />
        <div style={{
          position: 'fixed', width: '300px', height: '300px',
          top: '40%', left: '10%',
          background: 'var(--blob-sage)', borderRadius: '50%',
          filter: 'blur(90px)', opacity: 0.14,
        }} />
      </div>

      {/* Logo above card */}
      <div className="flex items-center gap-3 mb-8 select-none page-enter" style={{ zIndex: 1 }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blob-orange), var(--blob-blush))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(196,120,90,0.30)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '26px',
          fontStyle: 'italic', color: 'var(--color-text-heading)',
        }}>
          Cowrite
        </span>
      </div>

      {/* Glass card */}
      <div
        className="w-full max-w-[440px] page-enter"
        style={{
          background: 'var(--glass-modal-bg)',
          backdropFilter: 'var(--glass-modal-blur)',
          WebkitBackdropFilter: 'var(--glass-modal-blur)',
          border: '1px solid var(--glass-modal-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--glass-modal-shadow)',
          padding: '52px 44px',
          zIndex: 1,
          animationDelay: '80ms',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '1px', background: 'rgba(255,255,255,0.90)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          pointerEvents: 'none',
        }} />

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '32px',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--color-text-heading)', marginBottom: '6px',
        }}>
          Welcome back
        </h2>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '15px',
          color: 'var(--color-text-secondary)', marginBottom: '36px',
        }}>
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            containerStyle={{ marginBottom: '20px' }}
          />

          <div className="flex flex-col" style={{ marginBottom: '32px' }}>
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
                className="w-full bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[18px] py-[14px] font-sans text-[15px] text-[var(--color-text-body)] shadow-[var(--shadow-inset)] outline-none transition-all duration-[180ms] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_4px_var(--color-accent-glass),var(--shadow-inset)] focus:bg-[rgba(255,252,248,0.95)] placeholder:text-[var(--color-text-muted)] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-colors border-none bg-transparent cursor-pointer"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full !h-[52px] !rounded-[var(--radius-md)] !text-[15px] justify-center">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        <div className="text-center font-sans text-[14px] text-[var(--color-text-secondary)] select-none">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--color-accent)] font-medium hover:underline hover:text-[var(--color-accent-hover)] transition-all">
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
}

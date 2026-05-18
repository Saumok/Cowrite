'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        background: 'var(--glass-primary-bg)',
        backdropFilter: 'var(--glass-primary-blur)',
        WebkitBackdropFilter: 'var(--glass-primary-blur)',
        borderBottom: '1px solid var(--glass-primary-border)',
        boxShadow: 'var(--glass-primary-shadow)',
        transition: 'all 200ms ease',
      }}
    >
      {/* Top shimmer line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(255,255,255,0.85)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 48px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="max-md:px-5"
      >
        {/* LEFT — Logo + Wordmark */}
        <div
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {/* Custom pen nib SVG logo */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="flex-shrink-0">
            <circle cx="15" cy="15" r="14" fill="var(--color-accent)" opacity="0.12" />
            <path
              d="M20 10L10 20M17 8l5 5-10 10H8v-4L18 9l-1-1z"
              stroke="var(--color-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 20l-2 2"
              stroke="var(--color-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          {/* Cowrite wordmark */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontStyle: 'italic',
              color: 'var(--color-text-heading)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            Cowrite
          </span>
        </div>

        {/* RIGHT — User actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* User avatar pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--glass-btn-bg)',
                backdropFilter: 'var(--glass-btn-blur)',
                WebkitBackdropFilter: 'var(--glass-btn-blur)',
                border: '1px solid var(--glass-btn-border)',
                borderRadius: '999px',
                padding: '4px 14px 4px 4px',
                boxShadow: 'var(--glass-btn-shadow)',
                transition: 'all 200ms ease',
              }}
            >
              {/* Avatar gradient circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--blob-orange) 0%, var(--blob-blush) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(196,120,90,0.25)',
                }}
                title={user.name}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '0.03em',
                  }}
                >
                  {getInitials(user.name)}
                </span>
              </div>

              {/* Name — hidden on small screens */}
              <span
                className="hidden sm:block"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--color-text-body)',
                  letterSpacing: '-0.01em',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
            </div>

            {/* Logout glass pill button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'var(--glass-btn-bg)',
                backdropFilter: 'var(--glass-btn-blur)',
                WebkitBackdropFilter: 'var(--glass-btn-blur)',
                border: '1px solid var(--glass-btn-border)',
                borderRadius: '999px',
                padding: '8px 18px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                boxShadow: 'var(--glass-btn-shadow)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                userSelect: 'none',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-light)';
                e.currentTarget.style.borderColor = 'rgba(196,120,90,0.35)';
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-btn-bg)';
                e.currentTarget.style.borderColor = 'var(--glass-btn-border)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

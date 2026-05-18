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
        borderTop: '1px solid rgba(255,255,255,0.9)',
        boxShadow: 'var(--glass-primary-shadow)',
        transition: 'all 200ms ease',
      }}
    >
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
        {/* LEFT — Logo */}
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
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {/* SVG pen icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
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

          {/* Cowrite text */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              color: 'var(--color-text-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            Cowrite
          </span>
        </div>

        {/* RIGHT — Actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                padding: '5px 14px 5px 5px',
                boxShadow: 'var(--glass-btn-shadow)',
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--blob-orange), var(--blob-blush))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                title={user.name}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  {getInitials(user.name)}
                </span>
              </div>

              {/* Name text — hidden on mobile */}
              <span
                className="hidden sm:block"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-body)',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
            </div>

            {/* Logout button — glass ghost pill */}
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
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                boxShadow: 'var(--glass-btn-shadow)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                userSelect: 'none',
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
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

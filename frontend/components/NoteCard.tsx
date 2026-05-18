import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from '@/lib/utils';
import { NoteShare } from '@/types';

interface NoteCardProps {
  noteId: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  shares?: NoteShare[];
  shareCount?: number;
  onClick: () => void;
  onArchive?: () => void;
  index?: number;
}

// 6-color organic accent system keyed to note ID charCode
const accentPalette = [
  { strip: '#F4A96A', glow: 'rgba(244,169,106,0.18)', label: 'amber' },
  { strip: '#F2A58E', glow: 'rgba(242,165,142,0.18)', label: 'blush' },
  { strip: '#A8C4B8', glow: 'rgba(168,196,184,0.18)', label: 'sage' },
  { strip: '#A8C0D6', glow: 'rgba(168,192,214,0.18)', label: 'sky' },
  { strip: '#C9A8D4', glow: 'rgba(201,168,212,0.18)', label: 'lavender' },
  { strip: '#E8C547', glow: 'rgba(232,197,71,0.18)',  label: 'gold' },
];

export function NoteCard({
  noteId,
  title,
  excerpt,
  updatedAt,
  shares = [],
  shareCount,
  onClick,
  onArchive,
  index = 0,
}: NoteCardProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deterministic accent based on noteId character codes
  const accentIdx = noteId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % accentPalette.length;
  const accent = accentPalette[accentIdx];

  const finalShareCount = shareCount ?? shares.length;
  const relativeTime = formatDistanceToNow(updatedAt);

  // Stagger delay capped at 560ms
  const delay = Math.min(index * 80, 560);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-enter"
      style={{
        animationDelay: `${delay}ms`,
        position: 'relative',
        background: hovered
          ? 'rgba(255, 253, 250, 0.94)'
          : 'var(--glass-card-bg)',
        backdropFilter: 'var(--glass-card-blur)',
        WebkitBackdropFilter: 'var(--glass-card-blur)',
        border: hovered
          ? `1px solid ${accent.strip}55`
          : '1px solid var(--glass-card-border)',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 20px 48px ${accent.glow}, 0 8px 20px rgba(44,36,32,0.06), inset 0 1px 0 rgba(255,255,255,0.95)`
          : 'var(--glass-card-shadow)',
        transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Warm amber glass refraction overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--glass-refraction)',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: '24px',
        }}
      />

      {/* Top organic accent strip */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: `linear-gradient(90deg, ${accent.strip} 0%, ${accent.strip}99 100%)`,
          borderRadius: '24px 24px 0 0',
          zIndex: 2,
          opacity: hovered ? 1 : 0.75,
          transition: 'opacity 280ms ease',
        }}
      />

      {/* Subtle glow under accent strip on hover */}
      {hovered && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '40px',
            background: `radial-gradient(ellipse at top, ${accent.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Card body */}
      <div
        style={{
          padding: '26px 24px 22px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 3,
        }}
      >
        {/* Title with gradient shimmer */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 400,
            fontStyle: 'italic',
            marginBottom: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: hovered
              ? `linear-gradient(135deg, ${accent.strip} 0%, #5C3A2E 100%)`
              : 'linear-gradient(135deg, var(--color-text-heading), rgba(74,63,56,0.75))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transition: 'all 280ms ease',
          }}
        >
          {title || 'Untitled Note'}
        </h3>

        {/* Excerpt */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            minHeight: '44px',
            marginBottom: '20px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {excerpt || 'No content yet…'}
        </p>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '14px',
            borderTop: '1px solid rgba(196,181,173,0.20)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Timestamp */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              {mounted ? relativeTime : ''}
            </span>

            {/* Archive icon — appears on hover */}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                title="Archive to Cabinet"
                style={{
                  opacity: hovered ? 1 : 0,
                  padding: '4px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  transition: 'all 200ms ease',
                  pointerEvents: hovered ? 'auto' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-accent)';
                  e.currentTarget.style.background = 'var(--color-accent-glass)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="5" x="2" y="3" rx="1"/>
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
                  <path d="M10 12h4"/>
                </svg>
              </button>
            )}
          </div>

          {/* Collaborator count badge */}
          {finalShareCount > 0 && (
            <span
              style={{
                background: hovered ? `${accent.strip}22` : 'var(--color-accent-light)',
                color: hovered ? accent.strip : 'var(--color-accent)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                userSelect: 'none',
                border: hovered ? `1px solid ${accent.strip}55` : '1px solid transparent',
                transition: 'all 280ms ease',
              }}
            >
              {finalShareCount} collab{finalShareCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

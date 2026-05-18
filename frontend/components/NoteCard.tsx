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

// 5-color accent system keyed to note ID
const accentColors = [
  { strip: '#F4A96A', glow: 'rgba(244,169,106,0.15)' },
  { strip: '#F2A58E', glow: 'rgba(242,165,142,0.15)' },
  { strip: '#A8C4B8', glow: 'rgba(168,196,184,0.15)' },
  { strip: '#A8C0D6', glow: 'rgba(168,192,214,0.15)' },
  { strip: '#C9A8D4', glow: 'rgba(201,168,212,0.15)' },
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

  const accent = accentColors[noteId.charCodeAt(0) % accentColors.length];
  const finalShareCount = shareCount ?? shares.length;
  const relativeTime = formatDistanceToNow(updatedAt);

  // Stagger delay capped at 420ms
  const delay = Math.min(index * 70, 420);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-enter"
      style={{
        animationDelay: `${delay}ms`,
        position: 'relative',
        background: 'var(--glass-card-bg)',
        backdropFilter: 'var(--glass-card-blur)',
        WebkitBackdropFilter: 'var(--glass-card-blur)',
        border: hovered
          ? '1px solid rgba(196,120,90,0.30)'
          : '1px solid var(--glass-card-border)',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 20px 48px rgba(196,120,90,0.14), 0 8px 20px rgba(44,36,32,0.06), inset 0 1px 0 rgba(255,255,255,0.95)'
          : 'var(--glass-card-shadow)',
        transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        minHeight: '170px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Refraction overlay */}
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

      {/* Top accent strip — full width 3px */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accent.strip,
          borderRadius: '24px 24px 0 0',
          zIndex: 2,
        }}
      />

      {/* Card body — sits above refraction */}
      <div
        style={{
          padding: '24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Title — gradient shimmer */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 400,
            marginBottom: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: 'linear-gradient(135deg, var(--color-text-heading), rgba(44,36,32,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
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
            lineHeight: 1.65,
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

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid rgba(196,181,173,0.22)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Timestamp */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              {mounted ? relativeTime : ''}
            </span>

            {/* Archive icon button */}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                style={{
                  opacity: hovered ? 1 : 0,
                  padding: '4px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-accent)';
                  e.currentTarget.style.background = 'rgba(196,120,90,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Archive to Cabinet"
              >
                <svg
                  width="14"
                  height="14"
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
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                userSelect: 'none',
              }}
            >
              {finalShareCount} collaborator{finalShareCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

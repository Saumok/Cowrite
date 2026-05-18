'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { NoteShare } from '@/types';

interface ShareModalProps {
  noteId: string;
  noteTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  'var(--blob-orange)',
  'var(--blob-blush)',
  'var(--blob-sage)',
  'var(--blob-sky)',
];

const getUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function ShareModal({ noteId, noteTitle, isOpen, onClose }: ShareModalProps) {
  const [shares, setShares] = useState<NoteShare[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR'>('EDITOR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShares();
    }
  }, [isOpen, noteId]);

  const fetchShares = async () => {
    try {
      const { data } = await api.get(`/api/notes/${noteId}/shares`);
      setShares(data);
    } catch (error) {
      toast.error('Failed to load shares', { id: 'share-load-error' });
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/api/notes/${noteId}/share`, { email, role });
      toast.success('Note shared successfully!', { id: 'share-add-success' });
      setEmail('');
      fetchShares();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to share note', { id: 'share-add-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await api.delete(`/api/notes/${noteId}/share/${userId}`);
      toast.success('Access revoked', { id: 'share-revoke-success' });
      fetchShares();
    } catch (error) {
      toast.error('Failed to revoke access', { id: 'share-revoke-error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 select-none"
      style={{
        background: 'rgba(44, 36, 32, 0.20)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Click outside backdrop container */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Modal box */}
      <div 
        className="glass-modal w-full relative z-10 overflow-hidden flex flex-col"
        style={{
          padding: '40px',
          animation: 'modalEnter 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          maxWidth: 'min(460px, calc(100vw - 48px))',
        }}
      >
        {/* Close Button top-right of modal (X icon, ghost circular button 36px) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--glass-btn-bg)] hover:bg-[var(--color-elevated)] border border-[var(--glass-btn-border)] shadow-[var(--glass-btn-shadow)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-all duration-200 cursor-pointer select-none"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal headers */}
        <div className="mb-7 pr-10">
          <h2 
            className="font-sans font-normal"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              color: 'var(--color-text-heading)',
              lineHeight: '1.2',
            }}
          >
            Share this note
          </h2>
          {noteTitle && (
            <p className="font-sans text-[14px] text-[var(--color-text-secondary)] mt-1 truncate">
              {noteTitle}
            </p>
          )}
        </div>

        {/* Current collaborators section */}
        <div className="flex flex-col mb-6">
          <label className="block font-sans text-[11px] font-semibold tracking-[0.08em] text-[var(--color-text-secondary)] uppercase mb-3 select-none">
            People with Access
          </label>

          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
            {shares.length === 0 ? (
              <p className="font-sans text-[13px] text-[var(--color-text-secondary)] italic text-center py-4">
                No other collaborators yet.
              </p>
            ) : (
              shares.map((share) => {
                const u = share.user;
                if (!u) return null;

                return (
                  <div
                    key={share.id}
                    className="flex items-center justify-between gap-3 p-3 bg-[var(--glass-card-bg)] border border-[var(--glass-card-border)] shadow-sm rounded-xl backdrop-blur-[12px]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar (32px) */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white select-none border border-[var(--glass-primary-border)] shadow-sm"
                        style={{
                          background: 'linear-gradient(135deg, var(--blob-orange), var(--blob-blush))',
                        }}
                      >
                        <span className="font-sans text-[12px] font-semibold">
                          {u.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans font-medium text-[13px] text-[var(--color-text-heading)] leading-tight truncate">
                          {u.name}
                        </h4>
                        <p className="font-sans text-[11px] text-[var(--color-text-secondary)] truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role badge */}
                      {share.role === 'EDITOR' ? (
                        <span className="bg-[var(--color-accent-glass)] text-[var(--color-accent)] border border-[rgba(196,120,90,0.3)] shadow-[var(--glass-btn-shadow)] rounded-[var(--radius-full)] px-2.5 py-0.5 text-[11px] font-semibold">
                          Editor
                        </span>
                      ) : (
                        <span className="bg-[var(--color-sage-glass)] text-[var(--color-sage)] border border-[rgba(122,158,142,0.3)] shadow-[var(--glass-btn-shadow)] rounded-[var(--radius-full)] px-2.5 py-0.5 text-[11px] font-semibold">
                          Viewer
                        </span>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => handleRevoke(share.userId)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[#DC503C] hover:bg-[rgba(220,80,60,0.08)] transition-colors cursor-pointer select-none"
                        title="Revoke access"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Divider + "Add people" label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 20px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-modal-border)' }} />
          <span className="font-sans text-[11px] font-semibold tracking-[0.08em] text-[var(--color-text-secondary)] uppercase select-none">
            Add People
          </span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--glass-modal-border)' }} />
        </div>

        {/* Add form */}
        <form onSubmit={handleShare} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="collaborator@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />

          <div>
            {/* Role toggle (pill group, like tab switcher from dashboard) */}
            <div className="flex items-center p-1 bg-[var(--glass-btn-bg)] border border-[var(--glass-btn-border)] shadow-[var(--glass-btn-shadow)] rounded-[var(--radius-full)] w-full">
              <button
                type="button"
                onClick={() => setRole('EDITOR')}
                className="flex-1 py-1.5 rounded-[var(--radius-full)] text-xs font-sans font-medium transition-all duration-200 cursor-pointer select-none border-none outline-none"
                style={{
                  background: role === 'EDITOR' ? 'var(--color-accent)' : 'transparent',
                  color: role === 'EDITOR' ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: role === 'EDITOR' ? '0 2px 6px rgba(196,120,90,0.35)' : 'none',
                }}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setRole('VIEWER')}
                className="flex-1 py-1.5 rounded-[var(--radius-full)] text-xs font-sans font-medium transition-all duration-200 cursor-pointer select-none border-none outline-none"
                style={{
                  background: role === 'VIEWER' ? 'var(--color-accent)' : 'transparent',
                  color: role === 'VIEWER' ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: role === 'VIEWER' ? '0 2px 6px rgba(196,120,90,0.35)' : 'none',
                }}
              >
                Viewer
              </button>
            </div>
          </div>

          {/* Invite PRIMARY button (height 48px, border-radius radius-md) */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-[var(--radius-md)] justify-center shadow-md font-sans text-sm font-semibold select-none cursor-pointer outline-none transition-all flex items-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), #B85C3A)',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 12px rgba(196,120,90,0.30), inset 0 1px 0 rgba(255,255,255,0.25)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending invitation…' : 'Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}

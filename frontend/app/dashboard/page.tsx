'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Note } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [keyboardLegendOpen, setKeyboardLegendOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === '?') {
        e.preventDefault();
        setKeyboardLegendOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setArchiveOpen(false);
        setKeyboardLegendOpen(false);
      }
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleCreateNote();
      }
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const sInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (sInput) sInput.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, myNotes, sharedNotes]);

  const fetchNotes = async () => {
    try {
      const [myNotesRes, sharedNotesRes] = await Promise.all([
        api.get('/api/notes'),
        api.get('/api/notes/shared'),
      ]);

      const localArchived = localStorage.getItem('cowrite_archived');
      const archivedList: Note[] = localArchived ? JSON.parse(localArchived) : [];
      setArchivedNotes(archivedList);

      const archivedIds = new Set(archivedList.map(n => n.id));
      setMyNotes(myNotesRes.data.filter((n: Note) => !archivedIds.has(n.id)));
      setSharedNotes(sharedNotesRes.data.filter((n: Note) => !archivedIds.has(n.id)));
    } catch (error: any) {
      toast.error('Failed to load notes', { id: 'dashboard-load-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/api/notes', {
        title: 'Untitled Note',
        content: '',
      });
      toast.success('Note created!', { id: 'note-create-success' });
      router.push(`/notes/${data.id}`);
    } catch (error) {
      toast.error('Failed to create note', { id: 'note-create-error' });
      setCreating(false);
    }
  };

  const handleArchiveNote = (note: Note) => {
    try {
      const existing = localStorage.getItem('cowrite_archived');
      const parsed: Note[] = existing ? JSON.parse(existing) : [];
      if (parsed.some(n => n.id === note.id)) return;

      const updated = [note, ...parsed];
      localStorage.setItem('cowrite_archived', JSON.stringify(updated));
      setArchivedNotes(updated);

      setMyNotes(prev => prev.filter(n => n.id !== note.id));
      setSharedNotes(prev => prev.filter(n => n.id !== note.id));
      toast.success('Note sent to the Card Catalog Cabinet');
    } catch (err) {
      toast.error('Failed to archive note');
    }
  };

  const handleRestoreNote = (note: Note) => {
    try {
      const existing = localStorage.getItem('cowrite_archived');
      if (existing) {
        const parsed: Note[] = JSON.parse(existing);
        const filtered = parsed.filter(n => n.id !== note.id);
        localStorage.setItem('cowrite_archived', JSON.stringify(filtered));
        setArchivedNotes(filtered);
      }

      const isOwner = note.ownerId === (user as any)?.userId || note.ownerId === user?.id;
      if (isOwner) {
        setMyNotes(prev => [note, ...prev]);
      } else {
        setSharedNotes(prev => [note, ...prev]);
      }
      toast.success('Note restored to active workspace');
    } catch (err) {
      toast.error('Failed to restore note');
    }
  };

  const handleDeletePermanently = async (noteId: string) => {
    try {
      await api.delete(`/api/notes/${noteId}`);

      const existing = localStorage.getItem('cowrite_archived');
      if (existing) {
        const parsed: Note[] = JSON.parse(existing);
        const filtered = parsed.filter(n => n.id !== noteId);
        localStorage.setItem('cowrite_archived', JSON.stringify(filtered));
        setArchivedNotes(filtered);
      }
      toast.success('Note deleted permanently');
    } catch (err) {
      toast.error('Only the owner can delete this note permanently');
    }
  };

  const filterNotes = (notes: Note[]) => {
    if (!searchQuery) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  };

  const displayNotes = activeTab === 'my' ? filterNotes(myNotes) : filterNotes(sharedNotes);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good morning';
    if (hours >= 12 && hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
        <div className="animate-pulse text-[var(--color-text-secondary)] font-mono text-sm">
          Loading workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] relative overflow-x-hidden">
      <Navbar user={user} />

      <main 
        className="relative z-10 w-full px-12 max-md:px-5 page-enter"
        style={{
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: '52px',
          paddingBottom: '80px',
        }}
      >
        {/* ROW 1: Greeting */}
        <h1 
          className="leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(135deg, #2C2420 0%, #8B5A3C 60%, #C4785A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
          }}
        >
          {getGreeting()}, {user.name.split(' ')[0]}
        </h1>

        {/* ROW 2: Subtitle */}
        <p 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
          }}
        >
          You have {myNotes.length} notes · {sharedNotes.length} shared with you
        </p>

        {/* ROW 3: Action Bar (Flex Space Between) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6" style={{ marginBottom: '28px' }}>
          {/* Tab Switcher */}
          <div 
            className="w-fit flex items-center gap-2 p-[4px] rounded-full flex-shrink-0"
            style={{
              background: 'rgba(237, 232, 223, 0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: 'inset 0 2px 4px rgba(44,36,32,0.06)',
            }}
          >
            <button
              onClick={() => setActiveTab('my')}
              className="px-[28px] py-[10px] rounded-full text-[14px] font-sans font-medium transition-all duration-200 cursor-pointer select-none border-none outline-none flex items-center justify-center"
              style={{
                background: activeTab === 'my' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'my' ? 'white' : 'var(--color-text-secondary)',
                boxShadow: activeTab === 'my' ? '0 2px 10px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'my') e.currentTarget.style.color = 'var(--color-text-body)'; }}
              onMouseLeave={(e) => { if (activeTab !== 'my') e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              My Notes
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className="px-[28px] py-[10px] rounded-full text-[14px] font-sans font-medium transition-all duration-200 cursor-pointer select-none border-none outline-none flex items-center justify-center"
              style={{
                background: activeTab === 'shared' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'shared' ? 'white' : 'var(--color-text-secondary)',
                boxShadow: activeTab === 'shared' ? '0 2px 10px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'shared') e.currentTarget.style.color = 'var(--color-text-body)'; }}
              onMouseLeave={(e) => { if (activeTab !== 'shared') e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              Shared With Me
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-5 h-11 flex-shrink-0">
            <Button
              variant="secondary"
              onClick={() => setArchiveOpen(true)}
              className="!h-11 !px-7 text-sm tracking-wide flex items-center gap-2 border border-[var(--color-border)] shadow-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="2"/>
                <path d="M12 18h.01"/>
                <path d="M8 10h8"/>
                <path d="M8 14h8"/>
              </svg>
              Cabinet
            </Button>

            <button 
              onClick={handleCreateNote} 
              disabled={creating} 
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), #B85C3A)',
                border: 'none',
                borderRadius: '999px',
                padding: '11px 32px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 4px 16px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 220ms cubic-bezier(0.34,1.56,0.64,1)',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(196,120,90,0.40), inset 0 1px 0 rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              }}
            >
              {creating ? 'Creating...' : '+ New Note'}
            </button>
          </div>
        </div>

        {/* ROW 4: Search Bar */}
        <div className="relative w-full" style={{ marginBottom: '40px' }}>
          <div className="absolute left-[18px] top-1/2 -translate-y-1/2 z-10 text-[var(--color-text-muted)] pointer-events-none select-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search notes by title or content…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'var(--glass-card-bg)',
              backdropFilter: 'var(--glass-card-blur)',
              WebkitBackdropFilter: 'var(--glass-card-blur)',
              border: '1px solid var(--glass-card-border)',
              borderRadius: '999px',
              padding: '14px 20px 14px 48px',
              width: '100%',
              height: '52px',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--color-text-body)',
              boxShadow: 'var(--glass-card-shadow)',
              outline: 'none',
              transition: 'all 200ms ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(196,120,90,0.50)';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.10), var(--glass-card-shadow)';
              e.currentTarget.style.background = 'rgba(255,252,248,0.92)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-card-border)';
              e.currentTarget.style.boxShadow = 'var(--glass-card-shadow)';
              e.currentTarget.style.background = 'var(--glass-card-bg)';
            }}
          />
        </div>

        {/* PART D — Notes grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n, idx) => (
              <div
                key={n}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 h-40 animate-pulse flex flex-col justify-between"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="space-y-3">
                  <div className="h-5 bg-[var(--color-elevated)] rounded-full w-2/3" />
                  <div className="h-4 bg-[var(--color-elevated)] rounded-full w-full" />
                </div>
                <div className="h-4 bg-[var(--color-elevated)] rounded-full w-1/4" />
              </div>
            ))}
          </div>
        ) : displayNotes.length === 0 ? (
          /* PART F — Empty state */
          <div 
            className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-lg mx-auto bg-[var(--color-surface-glass)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-soft)] backdrop-blur-sm"
          >
            {/* SVG open book outline illustration (80px) */}
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--color-border)" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="select-none pointer-events-none text-[var(--color-text-muted)]"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>

            <h3 
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontStyle: 'italic', 
                fontSize: '22px',
                marginTop: '20px', 
                marginBottom: '8px',
                color: 'var(--color-text-heading)',
              }}
            >
              Your canvas is empty
            </h3>
            
            <p 
              style={{ 
                color: 'var(--color-text-secondary)', 
                fontSize: '15px', 
                marginBottom: '24px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {searchQuery
                ? 'No notes match your search parameters.'
                : 'Create your first note and start writing.'}
            </p>
            
            {!searchQuery && activeTab === 'my' && (
              <Button 
                onClick={handleCreateNote} 
                disabled={creating} 
                className="mx-auto shadow-md"
              >
                {creating ? 'Creating...' : '+ Create Note'}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNotes.map((note, index) => (
              <NoteCard
                key={note.id}
                noteId={note.id}
                title={note.title}
                excerpt={note.content ? note.content.substring(0, 100) : ''}
                updatedAt={note.updatedAt}
                shares={note.shares}
                onClick={() => router.push(`/notes/${note.id}`)}
                onArchive={() => handleArchiveNote(note)}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating keyboard shortcuts tactile keycap button */}
      <button
        onClick={() => setKeyboardLegendOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full border border-[#D1C7BD] bg-[#FAF9F6] shadow-[0_4px_12px_rgba(44,36,32,0.12)] cursor-pointer flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(44,36,32,0.18)] select-none z-[140] outline-none"
        style={{
          borderBottom: '3.5px solid #A8988D',
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'var(--color-text-heading)',
        }}
        title="Keyboard Shortcuts (Press ?)"
      >
        ?
      </button>

      {/* Overlay backdrop for Cabinet Drawer */}
      {archiveOpen && (
        <div 
          onClick={() => setArchiveOpen(false)}
          className="fixed inset-0 bg-[rgba(44,36,32,0.20)] backdrop-blur-[8px] z-[150] transition-opacity duration-300"
        />
      )}

      {/* Cabinet Slide-over Drawer FIX */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[420px] z-[160] transition-transform duration-300 p-8 flex flex-col justify-between"
        style={{
          transform: archiveOpen ? 'translateX(0)' : 'translateX(100%)',
          background: 'var(--glass-modal-bg)',
          backdropFilter: 'var(--glass-modal-blur)',
          WebkitBackdropFilter: 'var(--glass-modal-blur)',
          borderLeft: '1px solid var(--glass-modal-border)',
          boxShadow: 'var(--glass-modal-shadow)',
        }}
      >
        <div>
          <div className="flex flex-col mb-8 mt-4 select-none">
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '26px', color: 'var(--color-text-heading)', marginBottom: '6px' }}>
              Archive Cabinet
            </h2>
            <p className="text-[14px] font-sans" style={{ color: 'var(--color-text-secondary)' }}>
              {archivedNotes.length} card{archivedNotes.length !== 1 ? 's' : ''} in catalog
            </p>
          </div>

          {/* Scrollable catalog file drawer */}
          <div className="overflow-y-auto max-h-[calc(100vh-210px)] pr-2 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {archivedNotes.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-[16px] font-display italic text-[var(--color-text-muted)] mt-10">The catalog drawer is empty.</p>
              </div>
            ) : (
              archivedNotes.map((note) => (
                <div 
                  key={note.id}
                  className="bg-[var(--glass-card-bg)] p-5 rounded-lg border border-[var(--glass-card-border)] shadow-[var(--glass-card-shadow)] flex flex-col justify-between transition-all hover:scale-[1.02]"
                >
                  <div>
                    <h4 className="font-display font-normal text-[var(--color-text-heading)] text-[18px] leading-tight truncate mb-1">
                      {note.title || 'Untitled Note'}
                    </h4>
                    <p className="font-sans text-[13px] text-[var(--color-text-secondary)] mb-4 truncate">
                      Archived on {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[rgba(196,181,173,0.22)]">
                    <button
                      onClick={() => handleRestoreNote(note)}
                      className="px-3 py-1.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold text-xs border border-[rgba(196,120,90,0.2)] cursor-pointer hover:bg-[var(--color-accent)] hover:text-white transition-all outline-none"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeletePermanently(note.id)}
                      className="px-3 py-1.5 rounded bg-[var(--color-elevated)] text-[var(--color-text-secondary)] font-semibold text-xs border border-[var(--color-border)] cursor-pointer hover:bg-[#C0392B] hover:text-white hover:border-[#C0392B] transition-all outline-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 mt-auto">
          <button 
            onClick={() => setArchiveOpen(false)}
            style={{
              width: '100%',
              background: 'var(--color-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-body)',
              padding: '14px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-light)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-elevated)';
              e.currentTarget.style.color = 'var(--color-text-body)';
            }}
          >
            Close Cabinet Drawer
          </button>
        </div>
      </div>

      {/* Tactile Keyboard Legend Overlay */}
      {keyboardLegendOpen && (
        <div 
          onClick={() => setKeyboardLegendOpen(false)}
          className="fixed inset-0 bg-[rgba(44,36,32,0.20)] backdrop-blur-[8px] z-[170] flex items-center justify-center p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-modal rounded-[32px] p-8 max-w-md w-full"
          >
            {/* Leather strap loop element on top of card */}
            <div 
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '45px',
                height: '24px',
                backgroundColor: '#A88467', 
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                borderBottom: '3px solid #825F45',
              }}
            />

            <h3 
              className="text-center font-display italic text-[26px] mb-6 mt-2"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Tactile Shortcuts
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[rgba(196,181,173,0.22)]">
                <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">Create New Note</span>
                <div className="flex items-center gap-1.5">
                  <span className="tactile-key px-2.5 py-1 text-xs pressed">Alt</span>
                  <span className="text-[var(--color-text-muted)] text-xs font-mono">+</span>
                  <span className="tactile-key w-7 h-7 text-xs pressed">N</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[rgba(196,181,173,0.22)]">
                <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">Search Notes</span>
                <div className="flex items-center gap-1.5">
                  <span className="tactile-key px-2.5 py-1 text-xs pressed">Alt</span>
                  <span className="text-[var(--color-text-muted)] text-xs font-mono">+</span>
                  <span className="tactile-key w-7 h-7 text-xs pressed">S</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[rgba(196,181,173,0.22)]">
                <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">Open Help Cabinet</span>
                <div className="flex items-center gap-1.5">
                  <span className="tactile-key px-2 py-1 text-xs pressed">Shift</span>
                  <span className="text-[var(--color-text-muted)] text-xs font-mono">+</span>
                  <span className="tactile-key w-7 h-7 text-xs pressed">?</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[rgba(196,181,173,0.22)]">
                <span className="font-sans text-[14px] text-[var(--color-text-secondary)]">Close Cabinet Drawer</span>
                <span className="tactile-key px-2.5 py-1 text-xs pressed">Esc</span>
              </div>
            </div>

            <p className="text-center text-[12px] font-mono text-[var(--color-text-muted)] mt-6 italic">
              Press keycaps above to feel key presses!
            </p>

            <button
              onClick={() => setKeyboardLegendOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] bg-transparent border-none cursor-pointer p-1 rounded-full outline-none transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

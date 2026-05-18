'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SocketStatusBadge } from '@/components/SocketStatusBadge';
import { CollaboratorIndicator } from '@/components/CollaboratorIndicator';
import { ShareModal } from '@/components/ShareModal';
import { useAuth } from '@/hooks/useAuth';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { debounce, formatDistanceToNow } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Note, Collaborator, SocketStatus, SaveState } from '@/types';

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.noteId as string;
  const { user, loading: authLoading } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [paperStyle, setPaperStyle] = useState<'cream' | 'ruled' | 'dotted' | 'grid'>('cream');
  const [doodleOpen, setDoodleOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#2C2420'); 
  const [strokeWidth, setStrokeWidth] = useState(3.5);
  const [isEraser, setIsEraser] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState(false);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Calculate clean text for the textarea (no base64 sketches)
  const cleanText = useMemo(() => {
    if (!content) return '';
    return content.replace(/!\[Fountain Pen Sketch\]\(data:image\/png;base64,[^)]+\)/g, '').trim();
  }, [content]);

  // Extract all base64 sketches to render visually as Polaroid snapshots!
  const sketches = useMemo(() => {
    if (!content) return [];
    const matches: string[] = [];
    const regex = /!\[Fountain Pen Sketch\]\((data:image\/png;base64,[^)]+)\)/g;
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }, [content]);

  const handleTextareaChange = (newCleanText: string) => {
    // Format sketches back into markdown strings
    const sketchesString = sketches
      .map(url => `\n\n![Fountain Pen Sketch](${url})`)
      .join('');
      
    const newFullContent = newCleanText + sketchesString;
    handleContentChange(newFullContent);
  };

  const handleRemoveSketch = (indexToRemove: number) => {
    const remainingSketches = sketches.filter((_, idx) => idx !== indexToRemove);
    const sketchesString = remainingSketches
      .map(url => `\n\n![Fountain Pen Sketch](${url})`)
      .join('');
      
    const newFullContent = cleanText + sketchesString;
    handleContentChange(newFullContent);
    toast.success('Sketch removed from notebook!', { id: 'sketch-remove' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch note data and list of recent notes
  useEffect(() => {
    if (user && noteId) {
      fetchNote();
      fetchRecentNotes();
    }
  }, [user, noteId]);

  const fetchNote = async () => {
    try {
      const { data } = await api.get(`/api/notes/${noteId}`);
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("You don't have access to this note", { id: 'access-denied-error' });
        router.push('/dashboard');
      } else {
        toast.error('Failed to load note', { id: 'load-note-error' });
      }
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const { data } = await api.get('/api/notes');
      setRecentNotes(data);
    } catch (error) {
      console.error('Failed to load recent notes');
    }
  };

  // Socket.IO setup
  useEffect(() => {
    if (!user || !noteId || !note) return;

    const socket = getSocket();
    socket.connect();

    const joinNote = () => {
      setSocketStatus('connected');
      socket.emit('join-note', { noteId });
    };

    if (socket.connected) {
      joinNote();
    }

    socket.on('connect', joinNote);

    socket.on('disconnect', () => {
      setSocketStatus('reconnecting');
    });

    socket.on('receive-changes', ({ content: newContent }: { content: string }) => {
      setContent(newContent);
      setIsReceiving(true);
      setTimeout(() => setIsReceiving(false), 600);
    });

    socket.on('room-users', ({ users }: { users: Collaborator[] }) => {
      setCollaborators(users.filter((u) => u.userId !== user.id));
    });

    socket.on('user-typing', ({ userName }: { userId: string; userName: string }) => {
      setTypingUsers((prev) => new Set(prev).add(userName));
    });

    socket.on('user-stopped-typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        collaborators.forEach((c) => {
          if (c.userId === userId) {
            next.delete(c.userName);
          }
        });
        return next;
      });
    });

    // Deduplicate socket errors
    socket.on('error', ({ message }: { message: string }) => {
      toast.error(message, { id: 'socket-error' });
    });

    return () => {
      socket.emit('leave-note', { noteId });
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive-changes');
      socket.off('room-users');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('error');
      disconnectSocket();
    };
  }, [user, noteId, note, collaborators]);

  // Auto-save with debounce
  const saveNote = useCallback(
    async (newTitle: string, newContent: string) => {
      if (!note) return;

      setSaveState('saving');
      try {
        await api.patch(`/api/notes/${noteId}`, {
          title: newTitle,
          content: newContent,
        });
        setSaveState('saved');
        fetchRecentNotes(); // Refresh left sidebar list to update titles/timestamps
        setTimeout(() => setSaveState('idle'), 2000);
      } catch (error) {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    },
    [noteId, note]
  );

  const debouncedSave = useMemo(() => debounce(saveNote, 2000), [saveNote]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Emit to socket for real-time sync
    const socket = getSocket();
    if (socket.connected && note?.myRole !== 'VIEWER') {
      socket.emit('send-changes', { noteId, content: newContent });
    }

    // Emit typing indicator
    socket.emit('typing-start', { noteId });

    // Auto-save
    debouncedSave(title, newContent);
  };

  // Typing indicator timeout
  useEffect(() => {
    const socket = getSocket();
    const timeout = setTimeout(() => {
      socket.emit('typing-stop', { noteId });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [content, noteId]);

  // Delete note
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/api/notes/${noteId}`);
      toast.success('Note deleted', { id: 'delete-note-success' });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete note', { id: 'delete-note-error' });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FDFAF6' : strokeColor;
    ctx.lineWidth = strokeWidth;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const embedSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const markdownEmbed = `\n\n![Fountain Pen Sketch](${dataUrl})\n\n`;
    const newContent = content + markdownEmbed;
    handleContentChange(newContent);
    setDoodleOpen(false);
    toast.success('Sketch embedded in note!', { id: 'sketch-embed' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isReadOnly = note?.myRole === 'VIEWER';
  const isOwner = note?.myRole === 'OWNER';

  if (authLoading || loading || !user || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
        <div className="animate-pulse text-[var(--color-text-secondary)] font-mono text-sm">
          Loading notes…
        </div>
      </div>
    );
  }

  // Sidebar shared component with explicit cream color background
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--glass-primary-bg)] border-r border-[var(--glass-primary-border)] shadow-[var(--glass-primary-shadow)] backdrop-blur-[24px] select-none z-20">
      {/* Sidebar Header (64px height, padding 20px 16px 16px 16px) */}
      <div 
        className="border-b border-[var(--glass-primary-border)] flex items-center gap-3 flex-shrink-0" 
        style={{ padding: '20px 16px 16px 16px', height: '64px', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.4)' }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm font-sans font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-all duration-200 select-none border-none outline-none cursor-pointer bg-transparent hover:bg-[var(--glass-btn-bg)] px-2 py-1 -ml-2 rounded-md"
        >
          {/* Back chevron SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Dashboard
        </button>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-[2px]">
        {/* Styled label (0 padding top/bottom, 16px left/right, 16px top margin, 8px bottom margin) */}
        <p 
          className="text-[11px] text-[var(--color-accent)] uppercase font-sans font-bold tracking-[0.12em] select-none"
          style={{ padding: '0 16px', marginTop: '32px', marginBottom: '12px' }}
        >
          Recent Notes
        </p>
        
        {recentNotes.length === 0 ? (
          <p className="px-4 text-xs italic text-[var(--color-text-secondary)]">No other notes</p>
        ) : (
          recentNotes.map((n) => {
            const isActive = n.id === noteId;
            return (
              <button
                key={n.id}
                onClick={() => {
                  router.push(`/notes/${n.id}`);
                  setMobileSidebarOpen(false);
                }}
                className={`text-left transition-all relative flex flex-col gap-1 cursor-pointer border-none outline-none ${
                  isActive
                    ? 'bg-[var(--glass-btn-bg)] border border-[var(--glass-btn-border)] shadow-[var(--glass-btn-shadow)]'
                    : 'bg-transparent hover:bg-[var(--color-elevated)] border border-transparent'
                }`}
                style={{
                  padding: '12px 20px',
                  margin: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  width: 'calc(100% - 16px)',
                }}
              >
                {isActive && (
                  <span 
                    className="absolute left-0 top-[12px] bottom-[12px] w-[4px] rounded-r bg-[var(--color-accent)]" 
                    style={{ boxShadow: '0 0 8px rgba(196,120,90,0.5)' }}
                  />
                )}
                <span className="font-display text-[17px] tracking-wide text-[var(--color-text-heading)] truncate">
                  {n.title || 'Untitled Note'}
                </span>
                <span className="font-sans text-[11px] text-[var(--color-text-secondary)] mt-1">
                  {formatDistanceToNow(n.updatedAt)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer (bottom of sidebar, 24px height, padding 16px) */}
      <div 
        className="border-t border-[var(--glass-primary-border)] flex items-center justify-between gap-3 h-24 flex-shrink-0"
        style={{ padding: '16px', background: 'rgba(255,255,255,0.3)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}
      >
        <div className="flex items-center gap-2 truncate p-2 rounded-full border border-[var(--glass-btn-border)] bg-[var(--glass-btn-bg)] shadow-[var(--glass-btn-shadow)]">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white select-none flex-shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--blob-orange), var(--blob-blush))',
            }}
          >
            <span className="font-sans text-[12px] font-bold">
              {getInitials(user.name)[0]}
            </span>
          </div>
          <div className="truncate min-w-0 max-w-[100px] md:max-w-[120px] pr-2">
            <p className="text-xs font-sans font-medium text-[var(--color-text-heading)] truncate leading-tight">
              {user.name.split(' ')[0]}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer select-none border-none bg-transparent hover:bg-[var(--glass-btn-bg)] p-2 rounded-full"
          title="Logout"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex bg-[var(--color-canvas)] overflow-hidden">
      {/* 1. Left Panel (Sidebar - Desktop only) */}
      <aside className="hidden md:block w-[260px] h-full flex-shrink-0 border-r border-[var(--color-border)] z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[150] md:hidden flex">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-[rgba(44,36,32,0.25)] backdrop-blur-xs transition-opacity duration-200"
          />
          <aside className="relative w-[260px] h-full shadow-[var(--shadow-modal)] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 2. Right Panel (Main Editor Area) */}
      <div className="flex-1 h-full flex flex-col relative bg-[var(--color-canvas)] overflow-hidden">
               {/* Main Panel header (64px, sticky) */}
        <header className="sticky top-0 z-[100] h-[64px] border-b border-[var(--glass-primary-border)] bg-[var(--glass-primary-bg)] backdrop-blur-[24px] shadow-[var(--glass-primary-shadow)] flex-shrink-0 flex items-center">
          <div className="w-full h-full pl-12 pr-8 flex items-center justify-between relative">
            {/* Shimmer top border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/60 pointer-events-none" />

            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Hamburger (Mobile only) */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[var(--glass-btn-bg)] hover:bg-[var(--color-elevated)] border border-[var(--glass-btn-border)] text-[var(--color-text-heading)] transition-colors cursor-pointer select-none"
              >
                ☰
              </button>

              {/* Editable Title Input (Redesigned with glass box) */}
              <div 
                className="relative flex items-center group transition-all duration-200 w-fit" 
                style={{ 
                  marginLeft: '32px', // Explicit space from the left border
                  background: 'var(--color-surface-glass)', 
                  border: '1px solid var(--glass-card-border)', 
                  borderRadius: '16px',
                  padding: '6px 20px',
                  boxShadow: 'var(--shadow-soft), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(196,120,90,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(196,120,90,0.1), var(--shadow-soft), inset 0 1px 0 rgba(255,255,255,0.6)';
                  e.currentTarget.style.background = 'rgba(255,252,248,0.95)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-card-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft), inset 0 1px 0 rgba(255,255,255,0.6)';
                  e.currentTarget.style.background = 'var(--color-surface-glass)';
                }}
              >
                {/* Subtle Pen Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 opacity-70 flex-shrink-0">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled Note"
                  disabled={isReadOnly}
                  className="font-display text-[26px] font-normal italic placeholder:text-[var(--color-text-muted)] bg-transparent border-none focus:outline-none transition-all"
                  style={{
                    color: 'var(--color-text-heading)',
                    textShadow: '0 1px 1px rgba(255,255,255,0.8)',
                    width: title ? `max(3ch, ${title.length}ch)` : '13ch',
                    maxWidth: '420px',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Custom Sync Status Badge (READY / SAVING / ERROR) */}
              <div 
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full select-none transition-all duration-300"
                style={{
                  background: 
                    saveState === 'saving' ? 'var(--color-accent-glass)' : 
                    saveState === 'saved' ? 'var(--glass-btn-bg)' : 
                    saveState === 'error' ? 'rgba(220, 80, 60, 0.1)' : 'var(--glass-btn-bg)',
                  border: `1px solid ${
                    saveState === 'saving' ? 'rgba(196,120,90,0.35)' : 
                    saveState === 'saved' ? 'var(--glass-btn-border)' : 
                    saveState === 'error' ? 'rgba(220, 80, 60, 0.35)' : 'var(--glass-btn-border)'}`,
                  color: 
                    saveState === 'saving' ? 'var(--color-accent)' : 
                    saveState === 'saved' ? 'var(--color-sage)' : 
                    saveState === 'error' ? '#DC503C' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  boxShadow: 'var(--glass-btn-shadow)',
                  backdropFilter: 'var(--glass-btn-blur)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{
                  background: 
                    saveState === 'saving' ? 'var(--color-accent)' : 
                    saveState === 'saved' ? 'var(--color-sage)' : 
                    saveState === 'error' ? '#DC503C' : 'var(--color-text-secondary)',
                  animation: saveState === 'saving' || saveState === 'saved' ? 'livePulse 1.5s infinite ease-in-out' : 'none'
                }} />
                <span>
                  {saveState === 'saving' ? 'SAVING' : 
                   saveState === 'saved' ? 'READY' : 
                   saveState === 'error' ? 'ERROR' : 'READY'}
                </span>
              </div>

              {/* Custom Tactile Overlapping Avatars presence */}
              {collaborators.length > 0 && (
                <div className="flex items-center -space-x-2 pl-2 border-l border-[var(--color-border)]">
                  {collaborators.map((c, i) => {
                    const isTyping = typingUsers.has(c.userName);
                    return (
                      <div
                        key={c.userId}
                        className="relative w-8 h-8 rounded-full flex items-center justify-center text-white border border-[var(--glass-primary-border)] select-none transition-all duration-300 shadow-[var(--glass-btn-shadow)]"
                        style={{
                          background: `linear-gradient(135deg, ${i % 2 === 0 ? 'var(--blob-sky)' : 'var(--blob-sage)'}, var(--blob-blush))`,
                          boxShadow: isTyping ? '0 0 0 3px var(--color-accent)' : 'var(--glass-btn-shadow)',
                          transform: isTyping ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
                          zIndex: isTyping ? 30 : 10 + i,
                        }}
                        title={`${c.userName} ${isTyping ? '(typing…)' : '(active)'}`}
                      >
                        <span className="font-sans text-[11px] font-bold">
                          {c.userName.substring(0, 2).toUpperCase()}
                        </span>
                        <span 
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--glass-primary-bg)] ${
                            isTyping ? 'bg-[var(--color-accent)] animate-ping' : 'bg-[var(--color-sage)]'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Share Button (Owner only) */}
              {isOwner && (
                <button 
                  onClick={() => setShareModalOpen(true)} 
                  className="px-6 py-2 text-[13px] rounded-full shadow-md select-none cursor-pointer font-medium outline-none transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent), #B85C3A)',
                    border: 'none',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(196,120,90,0.40), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }}
                >
                  Share
                </button>
              )}

              {/* Context/Actions Menu ⋯ */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--glass-btn-bg)] hover:bg-[var(--color-elevated)] border border-[var(--glass-btn-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-heading)] transition-all duration-200 text-base cursor-pointer select-none outline-none shadow-[var(--glass-btn-shadow)]"
                  >
                    ⋯
                  </button>
                  {showMenu && (
                    <>
                      <div onClick={() => setShowMenu(false)} className="fixed inset-0 z-40" />
                      <div 
                        className="absolute right-0 mt-2 w-44 z-50 p-1 glass-modal rounded-[var(--radius-md)]"
                      >
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-sans font-semibold text-[#DC503C] hover:bg-[rgba(220,80,60,0.08)] rounded-[10px] transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2 outline-none"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                          Delete Note
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Typing Indicator Banner */}
        <div
          className={`relative z-10 bg-[var(--glass-primary-bg)]/80 backdrop-blur-md transition-all duration-300 flex items-center border-b border-[var(--glass-primary-border)] shadow-sm ${
            typingUsers.size > 0 ? 'opacity-100 h-8' : 'opacity-0 h-0 overflow-hidden border-transparent'
          }`}
        >
          <div className="max-w-[1240px] w-full mx-auto px-8 md:px-12 flex items-center h-full">
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-sans text-[var(--color-text-secondary)] select-none">
                <span>
                  {Array.from(typingUsers).join(', ')}{' '}
                  {typingUsers.size === 1 ? 'is' : 'are'} typing
                </span>
                {/* Sage colored bouncing dots */}
                <span className="flex gap-0.5 ml-1.5 items-center">
                  <span className="typing-dot" style={{ backgroundColor: 'var(--color-sage)' }} />
                  <span className="typing-dot" style={{ backgroundColor: 'var(--color-sage)' }} />
                  <span className="typing-dot" style={{ backgroundColor: 'var(--color-sage)' }} />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area scroll container */}
        <div className="relative z-10 flex-1 overflow-y-auto" style={{ padding: '32px 48px' }}>
          <div className="flex flex-col min-h-full" style={{ maxWidth: '760px', margin: '32px auto 0 auto' }}>
            {/* Editor Textarea with 600ms terracotta left border glow during remote changes */}
            <div
              className={`w-full flex-1 flex flex-col border transition-all duration-300 paper-${paperStyle} ${
                isReceiving 
                  ? 'editor-sync-flash' 
                  : 'border-[var(--glass-card-border)] shadow-[var(--glass-card-shadow)]'
              }`}
              style={{
                borderRadius: 'var(--radius-xl)',
                padding: '56px 64px',
                minHeight: 'calc(100vh - 200px)',
              }}
            >
              <textarea
                value={cleanText}
                onChange={(e) => handleTextareaChange(e.target.value)}
                placeholder="Start writing…"
                disabled={isReadOnly}
                style={{
                  lineHeight: paperStyle === 'ruled' ? '32px' : '2.0',
                }}
                className="paper-textarea w-full flex-1 bg-transparent border-none text-[20px] 
                           font-sans text-[var(--color-text-body)] focus:outline-none resize-none 
                           disabled:cursor-not-allowed min-h-[400px]"
              />
            </div>

            {/* Pinned Sketches Polaroid Gallery */}
            {sketches.length > 0 && (
              <div className="mt-8 border-t border-[rgba(196,181,173,0.22)] pt-6">
                <h4 className="font-display italic text-[16px] text-[var(--color-text-secondary)] mb-4 flex items-center gap-2 select-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  Sketchbook Attachments ({sketches.length})
                </h4>
                
                <div className="flex flex-wrap gap-5 justify-start">
                  {sketches.map((src, idx) => (
                    <div 
                      key={idx}
                      className="glass-card rounded-lg shadow-sm overflow-hidden group transition-all duration-200"
                      style={{ width: '200px' }}
                    >
                      {/* Drawing canvas image */}
                      <div className="bg-[#FDFAF6] border-b border-[var(--color-border)] overflow-hidden flex items-center justify-center p-2 h-[130px]">
                        <img 
                          src={src} 
                          alt={`Sketch ${idx + 1}`} 
                          className="max-h-full max-w-full object-contain select-none pointer-events-none"
                        />
                      </div>
                      
                      {/* Polaroid bottom metadata label */}
                      <div className="flex justify-between items-center p-2 px-3 select-none bg-[var(--color-surface-glass)]">
                        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                          Doodle #{idx + 1}
                        </span>
                        
                        {/* Remove pin button */}
                        {!isReadOnly && (
                          <button
                            onClick={() => handleRemoveSketch(idx)}
                            className="text-[var(--color-text-muted)] hover:text-[#DC503C] bg-transparent border-none cursor-pointer transition-colors p-1"
                            title="Remove sketch"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Horizontal elevated pill tab container for Paper Style & Doodle launcher */}
            <div className="flex justify-center mt-6 mb-6">
              <div 
                className="flex items-center gap-2 p-1 rounded-full bg-[var(--glass-btn-bg)] border border-[var(--glass-btn-border)] shadow-[var(--glass-btn-shadow)] backdrop-blur-[12px]"
                style={{ zIndex: 30 }}
              >
                <div className="flex items-center gap-2 border-r border-[var(--glass-primary-border)] pr-3 mr-3">
                  {(['cream', 'ruled', 'dotted', 'grid'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setPaperStyle(style)}
                      className="px-5 py-2 rounded-full text-xs font-sans font-medium transition-all duration-250 border-none cursor-pointer select-none capitalize outline-none"
                      style={{
                        background: paperStyle === style ? 'var(--color-accent)' : 'transparent',
                        color: paperStyle === style ? 'white' : 'var(--color-text-secondary)',
                        boxShadow: paperStyle === style ? '0 2px 6px rgba(196,120,90,0.35)' : 'none',
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setIsEraser(false);
                    setShowClearConfirm(false);
                    setDoodleOpen(true);
                  }}
                  className="px-6 py-2 rounded-full text-xs font-sans font-semibold text-[var(--color-accent)] hover:text-white hover:bg-[var(--color-accent)] hover:border-transparent transition-all duration-200 border border-[rgba(196,120,90,0.25)] bg-[var(--color-surface-glass)] cursor-pointer flex items-center gap-2 outline-none select-none"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  Doodle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Status Bar (48px, sticky with vertical padding clearance) */}
        <footer className="relative z-10 h-12 pb-4 pt-2 border-t border-[var(--glass-primary-border)] bg-[var(--glass-primary-bg)] backdrop-blur-[24px] shadow-[var(--glass-primary-shadow)] px-6 flex items-center justify-between text-[11px] font-mono text-[var(--color-text-secondary)] flex-shrink-0 select-none">
          <div>
            {saveState === 'saving' && <span className="text-[var(--color-text-muted)]">Saving…</span>}
            {saveState === 'saved' && <span className="text-[var(--color-sage)]">✓ Saved</span>}
            {saveState === 'error' && <span className="text-[#DC503C]">✗ Save failed</span>}
            {saveState === 'idle' && <span className="text-[var(--color-text-muted)]">Auto-saved</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>{getWordCount(cleanText)} words</span>
            <span>
              Edited {mounted && note ? formatDistanceToNow(note.updatedAt) : ''}
            </span>
          </div>
        </footer>
      </div>

      <ShareModal
        noteId={noteId}
        noteTitle={note.title}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Component 4: Quick-Doodle Canvas Overlay Redesign */}
      {doodleOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(44,36,32,0.20)] backdrop-blur-[8px] z-[300] flex items-center justify-center p-6"
          onClick={() => setDoodleOpen(false)}
        >
          <div 
            className="glass-modal rounded-[32px] overflow-hidden flex flex-col justify-between"
            style={{
              width: '680px',
              maxWidth: '95vw',
              animation: 'modalEnter 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
              zIndex: 310,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-14 px-6 border-b border-[var(--glass-modal-border)] flex justify-between items-center select-none bg-[var(--glass-primary-bg)]">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                <h3 className="font-display italic text-[18px] text-[var(--color-text-heading)] font-medium">Linen Doodle Pad</h3>
              </div>
              <button
                onClick={() => setDoodleOpen(false)}
                className="w-9 h-9 rounded-full bg-[var(--glass-btn-bg)] border border-[var(--glass-btn-border)] shadow-[var(--glass-btn-shadow)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] transition-all duration-150 cursor-pointer outline-none flex items-center justify-center text-lg text-[var(--color-text-secondary)] font-bold select-none"
              >
                &times;
              </button>
            </div>

            {/* Canvas layout */}
            <div 
              className="w-full relative cursor-crosshair bg-[#FDFAF6]"
              style={{ 
                height: '380px',
                backgroundImage: 'radial-gradient(circle, rgba(196,181,173,0.4) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              <canvas
                ref={canvasRef}
                width={680}
                height={380}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full block"
              />
            </div>

            {/* Canvas controls */}
            <div className="bg-[var(--glass-primary-bg)] border-t border-[var(--glass-modal-border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* 20 swatches */}
                <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                  {[
                    '#2C2420', '#5C4A3D', '#8B6F5E', '#C4B5AD',
                    '#C4785A', '#E07B54', '#D4543C', '#F2A58E',
                    '#F4A96A', '#E8C547', '#F5D87A', '#FFECB3',
                    '#7A9E8E', '#5B8A78', '#A8C4B8', '#6B8CAE',
                    '#9B7FA6', '#C9A8D4', '#F2C4B8', '#E8A0B4'
                  ].map((color) => {
                    const isSelected = strokeColor === color && !isEraser;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setIsEraser(false);
                          setStrokeColor(color);
                        }}
                        className="w-[28px] h-[28px] rounded-full border border-[var(--glass-btn-border)] cursor-pointer outline-none transition-all duration-150"
                        style={{
                          backgroundColor: color,
                          color: color,
                          transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                          boxShadow: isSelected 
                            ? '0 0 0 3.5px var(--color-canvas), 0 0 0 5.5px currentColor' 
                            : 'var(--glass-btn-shadow)',
                        }}
                        title={color}
                      />
                    );
                  })}
                </div>
                
                {/* Brush size & Live preview */}
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--glass-modal-border)] flex-shrink-0">
                  <span className="text-[12px] font-sans font-medium text-[var(--color-text-secondary)] select-none">Brush:</span>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1.5"
                      max="9"
                      step="0.5"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                      className="brush-slider w-20 cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((strokeWidth - 1.5) / 7.5) * 100}%, var(--color-elevated) ${((strokeWidth - 1.5) / 7.5) * 100}%, var(--color-elevated) 100%)`
                      }}
                    />
                    
                    {/* Live Preview circle */}
                    <div 
                      className="flex-shrink-0 flex items-center justify-center bg-[var(--color-canvas)] border border-[var(--glass-btn-border)] rounded-full w-9 h-9 shadow-[var(--shadow-inset)]"
                    >
                      <div style={{
                        width: `${strokeWidth}px`,
                        height: `${strokeWidth}px`,
                        maxWidth: '32px',
                        maxHeight: '32px',
                        minWidth: '4px',
                        minHeight: '4px',
                        borderRadius: '50%',
                        background: isEraser ? '#FDFAF6' : strokeColor,
                        transition: 'all 150ms ease',
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool actions */}
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                {/* Eraser */}
                <button
                  onClick={() => setIsEraser(!isEraser)}
                  className="px-3.5 py-2 text-xs font-sans font-medium rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 outline-none select-none shadow-[var(--glass-btn-shadow)] border"
                  style={{
                    background: isEraser ? 'var(--color-accent-glass)' : 'var(--glass-btn-bg)',
                    borderColor: isEraser ? 'rgba(196,120,90,0.35)' : 'var(--glass-btn-border)',
                    color: isEraser ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m20 20-4-4H8l-4 4h16z" />
                    <path d="M12 2 2 12v6h6L18 8l-6-6z" />
                  </svg>
                  Eraser
                </button>

                {/* Clear */}
                {showClearConfirm ? (
                  <div className="flex items-center gap-1 bg-[rgba(220,80,60,0.1)] border border-[rgba(220,80,60,0.3)] rounded-full px-2.5 py-1.5 transition-all duration-200">
                    <span className="text-[11px] font-sans font-semibold text-[#DC503C] select-none mr-1">Sure?</span>
                    <button
                      onClick={() => {
                        clearCanvas();
                        setShowClearConfirm(false);
                      }}
                      className="px-2.5 py-0.5 text-[10px] font-sans font-bold text-white bg-[#DC503C] rounded-full border-none cursor-pointer outline-none hover:bg-red-700 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-0.5 text-[10px] font-sans font-bold text-stone-600 bg-stone-200 rounded-full border-none cursor-pointer outline-none hover:bg-stone-300 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3.5 py-2 text-xs font-sans font-medium text-[var(--color-text-secondary)] bg-[var(--glass-btn-bg)] border border-[var(--glass-btn-border)] hover:bg-[rgba(220,80,60,0.08)] hover:text-[#DC503C] hover:border-[rgba(220,80,60,0.3)] rounded-full cursor-pointer transition-all outline-none shadow-[var(--glass-btn-shadow)]"
                  >
                    Clear
                  </button>
                )}

                {/* Embed */}
                <button
                  onClick={embedSketch}
                  className="px-4 py-2 text-xs font-sans font-semibold text-white border-none rounded-full cursor-pointer shadow-md transition-all outline-none flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent), #B85C3A)',
                    boxShadow: '0 2px 8px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(196,120,90,0.40), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(196,120,90,0.35), inset 0 1px 0 rgba(255,255,255,0.25)';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Embed Sketch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

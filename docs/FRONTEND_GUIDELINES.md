# FRONTEND_GUIDELINES.md — Design System

**Project:** Real-Time Collaborative Notes Platform
**Owner:** Saumok Kundu | LHCPL-SE-2026-3429

---

## 1. Design Principles

| Principle | Description |
|---|---|
| **Dark by Default** | The entire UI uses a dark mode palette. No light mode toggle is required for this assignment. |
| **Clean & Minimal** | No unnecessary decorations. Every element earns its place. |
| **Production-Ready** | The UI must look deployable — not like a prototype. Consistent spacing, no broken layouts. |
| **Highly Responsive** | Works correctly at 375px (mobile) through 1440px (desktop). Use Tailwind's responsive prefixes rigorously. |
| **Real-Time Awareness** | The UI must visually communicate the live collaborative state — who is present, connection status, sync state. |
| **Optimistic UI** | User's own edits appear instantly in the UI before the socket event round-trip completes. Never make the user wait for the network. |

---

## 2. Design Tokens

Define these as Tailwind CSS custom colors in `tailwind.config.ts` and as CSS variables in `globals.css`.

### Color Palette

```css
/* globals.css */
:root {
  /* Backgrounds */
  --color-bg-base:       #0f1117;   /* Deepest background — page root */
  --color-bg-surface:    #1a1d27;   /* Cards, panels, modals */
  --color-bg-elevated:   #242736;   /* Input fields, hovered cards */
  --color-bg-overlay:    #2e3347;   /* Dropdown menus, tooltips */

  /* Electric Blue Accent */
  --color-accent:        #3b82f6;   /* Primary CTA, active socket indicator */
  --color-accent-hover:  #2563eb;   /* Hover state on accent elements */
  --color-accent-muted:  #1e3a5f;   /* Subtle accent backgrounds */
  --color-accent-glow:   rgba(59, 130, 246, 0.25);   /* Glow / focus ring */

  /* Text */
  --color-text-primary:  #f1f5f9;   /* Headings, important labels */
  --color-text-secondary:#94a3b8;   /* Subtitles, metadata, timestamps */
  --color-text-muted:    #475569;   /* Placeholder text, disabled states */

  /* Status Colors */
  --color-success:       #22c55e;   /* Saved indicator, success toasts */
  --color-warning:       #f59e0b;   /* Reconnecting indicator */
  --color-error:         #ef4444;   /* Error toasts, delete confirmations */

  /* Borders */
  --color-border:        #2e3347;   /* Default card/input borders */
  --color-border-focus:  #3b82f6;   /* Focused input borders */
}
```

### Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0f1117',
          surface:  '#1a1d27',
          elevated: '#242736',
          overlay:  '#2e3347',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover:   '#2563eb',
          muted:   '#1e3a5f',
        },
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error:   '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'accent-glow': '0 0 0 3px rgba(59, 130, 246, 0.25)',
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 3. Typography

| Role | Class | Spec |
|---|---|---|
| Page Title (H1) | `text-3xl font-bold text-text-primary` | 30px, Bold, Inter |
| Section Header (H2) | `text-xl font-semibold text-text-primary` | 20px, Semibold |
| Card Title | `text-base font-medium text-text-primary` | 16px, Medium |
| Body / Editor | `text-sm text-text-primary leading-relaxed` | 14px, Regular |
| Metadata / Timestamps | `text-xs text-text-secondary` | 12px, Regular |
| Placeholder | `placeholder:text-text-muted` | 14px, Muted |
| Code / Monospace | `font-mono text-sm` | 14px, JetBrains Mono |

Import Inter from Google Fonts in `app/layout.tsx`:

```typescript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

---

## 4. Component Library

### 4.1 Primary Button

```tsx
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
    ghost:   'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-border',
    danger:  'bg-transparent text-status-error hover:bg-red-950 border border-status-error',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

### 4.2 Note Card

```tsx
// components/NoteCard.tsx
interface NoteCardProps {
  title: string;
  excerpt: string;
  updatedAt: string;
  collaboratorCount: number;
  onClick: () => void;
}

export function NoteCard({ title, excerpt, updatedAt, collaboratorCount, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-bg-surface border border-border rounded-xl p-4 cursor-pointer
                 hover:border-accent hover:bg-bg-elevated transition-all duration-200
                 shadow-card animate-fade-in group"
    >
      <h3 className="text-base font-medium text-text-primary mb-1 truncate group-hover:text-accent transition-colors">
        {title || 'Untitled Note'}
      </h3>
      <p className="text-xs text-text-secondary line-clamp-2 mb-3">{excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{updatedAt}</span>
        {collaboratorCount > 0 && (
          <span className="text-xs text-accent bg-accent-muted px-2 py-0.5 rounded-full">
            {collaboratorCount} collaborator{collaboratorCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 4.3 Input Field

```tsx
// components/ui/Input.tsx
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-bg-elevated border border-border rounded-lg px-3 py-2
                  text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:border-accent focus:shadow-accent-glow
                  transition-all duration-150 ${className}`}
      {...props}
    />
  );
}
```

### 4.4 Socket Status Badge

```tsx
// components/SocketStatusBadge.tsx
type Status = 'connected' | 'reconnecting' | 'disconnected';

const config: Record<Status, { dot: string; label: string; text: string }> = {
  connected:    { dot: 'bg-status-success animate-pulse-slow', label: '●', text: 'Live' },
  reconnecting: { dot: 'bg-status-warning animate-pulse',      label: '○', text: 'Reconnecting…' },
  disconnected: { dot: 'bg-status-error',                      label: '○', text: 'Disconnected' },
};

export function SocketStatusBadge({ status }: { status: Status }) {
  const { dot, text } = config[status];
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{text}</span>
    </div>
  );
}
```

### 4.5 Collaborator Avatar Stack

```tsx
// components/CollaboratorIndicator.tsx
interface Collaborator { name: string; color: string; }

export function CollaboratorIndicator({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <div className="flex -space-x-2">
      {collaborators.slice(0, 4).map((c, i) => (
        <div
          key={i}
          title={c.name}
          style={{ backgroundColor: c.color }}
          className="w-7 h-7 rounded-full border-2 border-bg-base flex items-center justify-center
                     text-xs font-semibold text-white uppercase"
        >
          {c.name[0]}
        </div>
      ))}
      {collaborators.length > 4 && (
        <div className="w-7 h-7 rounded-full border-2 border-bg-base bg-bg-overlay
                        flex items-center justify-center text-xs text-text-secondary">
          +{collaborators.length - 4}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Animation Guidelines

### 5.1 Real-Time Sync Indicator

When a `receive-changes` socket event arrives and updates the editor, briefly flash the editor border to signal remote content arrival:

```tsx
// In NoteEditor.tsx
const [isReceiving, setIsReceiving] = useState(false);

socket.on('receive-changes', (delta) => {
  applyDelta(delta);
  setIsReceiving(true);
  setTimeout(() => setIsReceiving(false), 600);
});

// Apply to editor container:
<div className={`border rounded-xl transition-all duration-300
  ${isReceiving ? 'border-accent shadow-accent-glow' : 'border-border'}`}>
  <textarea ... />
</div>
```

### 5.2 Auto-Save Status Transition

```tsx
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const saveLabels: Record<SaveState, string> = {
  idle:   '',
  saving: 'Saving…',
  saved:  '✓ Saved',
  error:  '✗ Save failed',
};

const saveColors: Record<SaveState, string> = {
  idle:   '',
  saving: 'text-text-muted',
  saved:  'text-status-success',
  error:  'text-status-error',
};

<span className={`text-xs transition-colors duration-300 ${saveColors[saveState]}`}>
  {saveLabels[saveState]}
</span>
```

### 5.3 Optimistic UI Updates

User's own typed content must appear instantly — do **not** wait for the socket echo or API response before displaying it. The pattern:

1. **Update local state immediately** on `onChange`.
2. **Emit `send-changes`** to backend (fire-and-forget).
3. **Debounce PATCH** `/api/notes/:id` for persistence (2s debounce).
4. On `receive-changes` from server, **apply only if the event originated from another socket** (server excludes the sender, so this is automatic).

This eliminates any perceived lag for the local user while still syncing all changes to remote collaborators.

### 5.4 Typing Indicator Animation

```tsx
// Pulsing dots for "X is typing…"
<div className="flex items-center gap-1 text-xs text-text-muted">
  <span>{typingUser} is typing</span>
  <span className="flex gap-0.5 ml-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-1 h-1 bg-text-muted rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
</div>
```

### 5.5 Page Transition

Wrap route content in a simple fade-in container:

```tsx
<div className="animate-fade-in">
  {children}
</div>
```

Defined in Tailwind config (see Section 2). Keeps navigation feeling smooth without heavy animation libraries.

# APP_FLOW.md — Application Flow Documentation

**Project:** Real-Time Collaborative Notes Platform
**Owner:** Saumok Kundu | LHCPL-SE-2026-3429

---

## 1. Entry Points

| Entry Point | URL | Description |
|---|---|---|
| **Primary (Production)** | `https://<project>.vercel.app` | Live Vercel deployment — public entry point for evaluators |
| **Login Page** | `/login` | Default redirect for unauthenticated users |
| **Signup Page** | `/signup` | New user registration |
| **Dashboard** | `/dashboard` | Protected route — requires valid JWT |
| **Note Editor** | `/notes/[noteId]` | Protected route — requires note access (owner or shared) |

---

## 2. Core User Flows

### 2.1 Authentication Flow

```
[User visits /dashboard]
        │
        ▼
[Auth middleware checks JWT]
        │
   ┌────┴────┐
   │         │
[Valid]   [Invalid / Missing]
   │         │
   ▼         ▼
[Dashboard] [Redirect → /login]
              │
              ▼
     [User enters credentials]
              │
         ┌────┴────┐
         │         │
      [Success] [Failure]
         │         │
         ▼         ▼
    [Store JWT]  [Show error toast]
    [→ /dashboard]
```

### 2.2 Dashboard View Flow

```
[/dashboard loads]
        │
        ▼
[GET /api/notes  (own notes)]
[GET /api/notes/shared  (shared notes)]
        │
        ▼
[Render Note Cards Grid]
        │
   ┌────┴───────────────┐
   │                    │
[Click Note Card]   [Click + New Note]
   │                    │
   ▼                    ▼
[→ /notes/[noteId]]  [POST /api/notes]
                         │
                         ▼
                    [→ /notes/[newNoteId]]
```

### 2.3 Note Editing & Socket Sync Flow

```
[User opens /notes/[noteId]]
        │
        ▼
[GET /api/notes/:id  — fetch latest content]
        │
        ▼
[Render Note Editor with fetched content]
        │
        ▼
[Socket.IO client connects to Render backend]
[Emits: join-note  { noteId, userId }]
        │
        ▼
[Server adds socket to room: `note-${noteId}`]
        │
        ▼
[User types in editor]
        │
        ▼
[Debounced onChange handler fires]
        │
   ┌────┴─────────────────────┐
   │                          │
[Emit: send-changes         [Auto-save: PATCH /api/notes/:id]
 { noteId, delta }]          (every 2s debounce)
        │
        ▼
[Server receives send-changes]
[Broadcasts: receive-changes to room]
[Excludes sender socket]
        │
        ▼
[All other users in room receive receive-changes]
[Their editors update with new delta]
```

### 2.4 Sharing Flow

```
[Note Editor → Share Button]
        │
        ▼
[Share Modal opens]
[Input: collaborator email + role (Viewer/Editor)]
        │
        ▼
[POST /api/notes/:id/share  { email, role }]
        │
   ┌────┴────┐
   │         │
[200 OK]  [404 User not found]
   │         │
   ▼         ▼
[Toast: Shared!]  [Toast: User not found]
[Collaborator list updates]
```

---

## 3. Navigation Map

```
/
├── /login                  → Unauthenticated entry
├── /signup                 → New user registration
└── /dashboard              → Protected
    ├── (tab) My Notes      → Notes owned by user
    ├── (tab) Shared        → Notes shared with user
    └── /notes/[noteId]     → Protected note editor
        └── (modal) Share   → Sharing permission manager
```

---

## 4. Screen Inventory

### Screen 1 — Login (`/login`)
- Email input
- Password input
- Submit button → POST `/api/auth/login`
- Link to `/signup`
- Error state: invalid credentials toast
- Success state: redirect to `/dashboard`

### Screen 2 — Signup (`/signup`)
- Name input
- Email input
- Password input
- Submit button → POST `/api/auth/signup`
- Link to `/login`
- Validation: email format, password min-length

### Screen 3 — Dashboard (`/dashboard`)
- Top navigation bar (logo, user avatar, logout)
- "My Notes" / "Shared With Me" tab toggle
- Search/filter input bar
- Note cards grid (title, last-updated timestamp, collaborator count)
- Floating "+ New Note" action button
- Empty state illustration when no notes exist

### Screen 4 — Note Editor (`/notes/[noteId]`)
- Editable title field (full-width, large)
- Main textarea / content editor
- Live collaboration indicator (colored dots for active users in room)
- Typing indicator ("Rohan is typing…")
- Socket connection status badge (● Connected / ○ Reconnecting…)
- Share button → opens Share Modal
- Delete button (owner only)
- Back button → `/dashboard`
- Auto-save indicator ("Saved" / "Saving…")

### Screen 5 — Share Modal (overlay on Note Editor)
- Current collaborators list (email, role, remove button)
- Add collaborator: email input + role dropdown (Viewer / Editor)
- Confirm share button
- Close / dismiss

---

## 5. Decision Points

| Decision | Condition | Outcome A | Outcome B |
|---|---|---|---|
| Route access | JWT valid? | Render requested page | Redirect to `/login` |
| Note access | User is owner or shared? | Load editor | 403 Forbidden page |
| Editor mode | User role == Editor? | Editable textarea | Read-only textarea |
| Share action | Target email exists? | Create NoteShare record | Return 404 error |
| Socket emit | User role == Editor? | Allow `send-changes` | Silently ignore / block |
| Delete note | User is owner? | Show delete button | Hide delete button |

---

## 6. Error Handling Flows

### 6.1 Socket Connection Dropped (Render cold start or network loss)

```
[Socket disconnects]
        │
        ▼
[Show status badge: "○ Reconnecting…" (amber)]
        │
        ▼
[Socket.IO client auto-reconnects]
[Exponential back-off: 1s → 2s → 4s → 8s (max)]
        │
   ┌────┴────┐
   │         │
[Reconnected] [Max retries exceeded]
   │           │
   ▼           ▼
[Emit: join-note again]   [Show toast: "Connection lost.
[Fetch latest content      Please refresh the page."]
 via GET /api/notes/:id]
[Resume editing]
```

### 6.2 API Error (5xx from Render backend)

```
[PATCH /api/notes/:id fails]
        │
        ▼
[Auto-save sets status: "Save failed"]
[Retry after 5 seconds]
[If 3 consecutive failures: show error toast]
["Your changes may not be saved. Check connection."]
```

### 6.3 Simultaneous Edit Conflict (Last-Write-Wins)

The current implementation uses a **last-write-wins** strategy via Socket.IO delta broadcasting. No operational transform or CRDT is implemented (out of scope). The most recent `send-changes` event wins.

### 6.4 Unauthorized Note Access

```
[GET /api/notes/:id returns 403]
        │
        ▼
[Redirect to /dashboard]
[Show toast: "You don't have access to this note."]
```

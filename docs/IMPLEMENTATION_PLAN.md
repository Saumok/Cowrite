# IMPLEMENTATION_PLAN.md — The Build Sequence

**Project:** Real-Time Collaborative Notes Platform
**Owner:** Saumok Kundu | LHCPL-SE-2026-3429
**Deadline:** 19 May 2026 (3-day sprint)

---

## Overview

| Day | Focus | Phases |
|---|---|---|
| Day 1 (17 May) | Foundation + Auth + Database | Phase 1, Phase 2 |
| Day 2 (18 May) | Real-Time Engine + UI | Phase 3, Phase 4 |
| Day 3 (19 May) | Deployment + Polish + Submit | Phase 5, Phase 6 |

---

## Phase 1 — Foundation

**Goal:** Monorepo scaffold, tooling configured, databases connected. Zero business logic yet.

### 1.1 Repository Setup

```bash
# Create monorepo root
mkdir collaborative-notes && cd collaborative-notes
git init
echo "node_modules\n.env\n.env.local\ndist\n.next" > .gitignore

# Create two workspace directories
mkdir frontend backend docs
```

### 1.2 Backend Scaffold

```bash
cd backend
npm init -y
npm install express socket.io cors dotenv helmet express-rate-limit jsonwebtoken bcryptjs
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs

# Init TypeScript
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --strict
```

Create `backend/src/index.ts` with a minimal Express app + health check route.

### 1.3 Prisma Setup

```bash
cd backend
npm install @prisma/client
npm install -D prisma

npx prisma init   # Creates prisma/schema.prisma and .env
```

- Edit `prisma/schema.prisma` — paste the full schema from `BACKEND_STRUCTURE.md` Section 2.
- Set `DATABASE_URL` in `backend/.env` (use local Postgres for now: `postgresql://postgres:password@localhost:5432/collabnotes`).

```bash
npx prisma migrate dev --name init   # Creates tables locally
npx prisma generate                  # Generates Prisma Client
```

### 1.4 Frontend Scaffold

```bash
cd ../frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
npm install socket.io-client axios react-hot-toast
```

- Create `lib/api.ts` — axios instance with `baseURL = process.env.NEXT_PUBLIC_BACKEND_URL`.
- Create `lib/socket.ts` — socket.io-client singleton (see `TECH_STACK.md` Section 7).
- Create `frontend/.env.local` with `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`.

### 1.5 Tailwind Dark Mode Config

- Apply design tokens from `FRONTEND_GUIDELINES.md` Section 2 to `tailwind.config.ts`.
- Set `bg-bg-base` as the root background in `app/globals.css`.
- Add `<html className="dark">` to `app/layout.tsx`.

### ✅ Phase 1 Done When:
- `GET http://localhost:5000/health` returns `{ status: "ok" }`
- `http://localhost:3000` renders a dark background page without errors
- `npx prisma studio` shows User, Note, NoteShare tables

---

## Phase 2 — Auth & Database

**Goal:** Working JWT auth + full Notes CRUD API.

### 2.1 Auth Endpoints

Create `backend/src/routes/auth.ts`:

- `POST /api/auth/signup` — hash password with bcrypt → create User → sign JWT → return `{ token, user }`
- `POST /api/auth/login` — find User by email → compare password → sign JWT → return `{ token, user }`

Create `backend/src/middleware/auth.ts`:
- Extract `Authorization: Bearer <token>` header
- Verify JWT → attach `req.user = { userId, name, email }` to request
- Return 401 if missing or invalid

### 2.2 Notes CRUD API

Create `backend/src/routes/notes.ts` with all endpoints from `BACKEND_STRUCTURE.md` Section 3:
- Apply `auth` middleware to all note routes
- `GET /api/notes` — `WHERE ownerId = req.user.userId`
- `GET /api/notes/shared` — find NoteShares where userId matches, include Note data
- `POST /api/notes` — create with `ownerId = req.user.userId`
- `GET /api/notes/:id` — verify owner or shared, return note
- `PATCH /api/notes/:id` — verify owner or EDITOR, update
- `DELETE /api/notes/:id` — verify owner only, delete

### 2.3 Sharing API

Add to `backend/src/routes/notes.ts`:
- `POST /api/notes/:id/share` — find user by email, upsert NoteShare
- `DELETE /api/notes/:id/share/:userId` — delete NoteShare record
- `GET /api/notes/:id/shares` — return shares with user info

### 2.4 Auth UI

Create minimal auth pages in Next.js:
- `app/(auth)/signup/page.tsx` — form → POST `/api/auth/signup` → store token → push to `/dashboard`
- `app/(auth)/login/page.tsx` — form → POST `/api/auth/login` → store token → push to `/dashboard`
- `hooks/useAuth.ts` — reads token from localStorage, exposes `user`, `logout()`

### ✅ Phase 2 Done When:
- Signup creates a User row in the database
- Login returns a valid JWT
- `GET /api/notes` with a valid bearer token returns an empty array (no error)
- Visiting `/dashboard` without a token redirects to `/login`

---

## Phase 3 — Real-Time Engine

**Goal:** Socket.IO rooms fully functional. Two browser tabs can collaborate on the same note.

### 3.1 Socket.IO Server Integration

In `backend/src/index.ts`:
- Replace `app.listen()` with `http.createServer(app)` + `new Server(httpServer, { cors: {...} })`
- Add JWT authentication middleware on `io.use()`
- Call `registerNoteHandlers(io, socket)` for each new connection

Implement `backend/src/socket/noteHandlers.ts` — full implementation from `BACKEND_STRUCTURE.md` Section 4.

### 3.2 Note Editor with Socket Integration

Create `app/notes/[noteId]/page.tsx`:

```typescript
// Simplified flow
const [content, setContent] = useState('');
const [socketStatus, setSocketStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

useEffect(() => {
  // 1. Fetch note via REST (source of truth)
  fetchNote(noteId).then(note => setContent(note.content));

  // 2. Connect socket and join room
  socket.connect();
  socket.emit('join-note', { noteId });

  // 3. Listen for remote changes
  socket.on('receive-changes', ({ content }) => setContent(content));
  socket.on('connect', () => setSocketStatus('connected'));
  socket.on('disconnect', () => setSocketStatus('reconnecting'));

  return () => {
    socket.emit('leave-note', { noteId });
    socket.off('receive-changes');
    socket.disconnect();
  };
}, [noteId]);

// On local change
const handleChange = useMemo(() =>
  debounce((newContent: string) => {
    socket.emit('send-changes', { noteId, content: newContent });
    patchNote(noteId, { content: newContent }); // auto-save
  }, 300),
[noteId]);
```

### 3.3 Typing Indicators

- On `onChange`: emit `typing-start`
- On debounce timeout (1.5s of inactivity): emit `typing-stop`
- Listen for `user-typing` and `user-stopped-typing` to update a `typingUsers` state array

### 3.4 Room Users (Collaborator Indicators)

- Listen for `room-users` event → update `collaborators` state
- Pass to `<CollaboratorIndicator />` component

### ✅ Phase 3 Done When:
- Open same note in two browser tabs (different users)
- Type in Tab A → text appears in Tab B within < 100ms
- Close Tab A → collaborator indicator removes that user in Tab B
- Disconnect network → status badge shows "Reconnecting…" → reconnects automatically

---

## Phase 4 — UI & Dashboard

**Goal:** Complete, polished UI for all screens. All design tokens applied.

### 4.1 Dashboard Page

Create `app/dashboard/page.tsx`:
- Fetch own notes + shared notes in `Promise.all()`
- Render two tabs: "My Notes" / "Shared With Me"
- Render `<NoteCard />` grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Search input — filter notes client-side by title/content
- "+ New Note" button → `POST /api/notes` → push to `/notes/[newId]`

### 4.2 Note Editor Page

Finalize `app/notes/[noteId]/page.tsx`:
- Editable title (`<input>`) + content (`<textarea>`) — both wired to socket + REST
- `<SocketStatusBadge status={socketStatus} />`
- `<CollaboratorIndicator collaborators={collaborators} />`
- Typing indicator display
- Share button → `<ShareModal />`
- Delete button (owner only) → confirm dialog → `DELETE /api/notes/:id` → push to `/dashboard`
- Auto-save status label

### 4.3 Share Modal

Create `components/ShareModal.tsx`:
- List current shares (user email, role badge, revoke button)
- Add collaborator: email input + role select → POST share API
- Show validation errors inline

### 4.4 Navigation

Create `components/Navbar.tsx`:
- Left: Logo / App name
- Right: User name, Logout button

### 4.5 Responsiveness Pass

- Test all pages at 375px, 768px, 1280px viewports
- Fix any overflow, truncation, or layout issues
- Ensure note card grid reflows correctly

### ✅ Phase 4 Done When:
- Full CRUD works end-to-end through the UI
- Dashboard search filters notes in real time
- Share modal successfully shares a note and the collaborator can access it
- UI is visually consistent with the design tokens in `FRONTEND_GUIDELINES.md`

---

## Phase 5 — Production Prep & Deployment

**Goal:** Live public URL at a Vercel domain. Backend accessible on Render. Database on Supabase.

### 5.1 Deploy Database (Supabase)

1. Create project at `supabase.com`
2. Go to **Settings → Database → Connection String** (URI format, Transaction mode)
3. Copy the connection string — this becomes `DATABASE_URL` in Render

### 5.2 Update Backend CORS

In `backend/src/index.ts`, ensure `FRONTEND_URL` env var is used in the allowed origins array (already implemented if following `TECH_STACK.md` Section 8). Do **not** hardcode the Vercel URL.

### 5.3 Deploy Backend to Render

1. Push code to GitHub (`git push origin main`)
2. Go to `render.com` → New → Web Service
3. Connect GitHub repo → Root Directory: `backend`
4. Runtime: Node, Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
5. Start Command: `npm start`
6. Add environment variables:
   - `DATABASE_URL` = Supabase connection string
   - `JWT_SECRET` = (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `FRONTEND_URL` = (set to `*` temporarily until Vercel URL is known, update after)
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
7. Deploy. Note the Render URL (e.g. `https://collab-notes-api.onrender.com`).

### 5.4 Deploy Frontend to Vercel

1. Go to `vercel.com` → New Project
2. Import GitHub repo → Root Directory: `frontend`
3. Framework: Next.js (auto-detected)
4. Add environment variable: `NEXT_PUBLIC_BACKEND_URL` = Render URL from Step 5.3
5. Deploy. Note the Vercel URL (e.g. `https://collab-notes.vercel.app`).

### 5.5 Update CORS on Render

Go back to Render → Environment Variables → Update `FRONTEND_URL` to the exact Vercel URL from Step 5.4.
Render auto-redeploys on env var change.

### 5.6 End-to-End Smoke Test (Production)

- [ ] Signup with a new email on the live Vercel URL
- [ ] Create a note
- [ ] Open the same note in an Incognito window with a different account
- [ ] Type in one window — confirm changes appear in the other
- [ ] Check Socket Status badge shows "● Live"
- [ ] Share note with the second account as Editor, confirm editing works
- [ ] Share as Viewer, confirm textarea is read-only

### ✅ Phase 5 Done When:
- Live Vercel URL is accessible publicly
- All smoke tests pass in production

---

## Phase 6 — Final Submission

**Goal:** Polished README. Clean Git history. Submission package ready.

### 6.1 README.md (repository root)

The README must be the first impression for evaluators. Structure:

```markdown
# Real-Time Collaborative Notes Platform

> Live Demo: https://<project>.vercel.app

A full-stack collaborative note-taking app built for Lavish Health Care Private Limited.
Multiple users can edit the same note simultaneously — changes sync in real time via Socket.IO.

## Architecture

[Diagram: Vercel (Next.js) ←→ Render (Express + Socket.IO) ←→ Supabase (PostgreSQL)]

Split deployment to support persistent WebSocket connections — Vercel's serverless
functions cannot hold open TCP connections, so the Socket.IO server runs on Render
as a persistent process.

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, Socket.IO 4
- Database: PostgreSQL + Prisma ORM
- Deployment: Vercel (frontend) + Render (backend) + Supabase (database)

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Supabase account

### Steps
\`\`\`bash
# Clone
git clone https://github.com/<username>/collaborative-notes.git
cd collaborative-notes

# Backend
cd backend && cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, FRONTEND_URL
npm install && npx prisma migrate dev && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
npm install && npm run dev
\`\`\`

## Key Features
- JWT authentication (Signup / Login / Logout)
- Full note CRUD with auto-save
- Real-time collaboration via Socket.IO rooms
- Sharing with Viewer / Editor permissions
- Live collaborator presence & typing indicators
- Dark mode UI with electric blue accents
```

### 6.2 Git History Cleanup

Ensure commit history is meaningful:

```
feat: scaffold frontend and backend projects
feat: add Prisma schema and initial migration
feat: implement JWT auth (signup, login)
feat: add Notes CRUD API
feat: add note sharing with role permissions
feat: integrate Socket.IO with note rooms
feat: implement send-changes and receive-changes events
feat: add typing indicators
feat: build dashboard UI with note cards
feat: build note editor with real-time sync
feat: add share modal component
chore: configure CORS for Vercel/Render split deployment
chore: add environment variables and deployment config
docs: add README with live demo link and architecture overview
```

### 6.3 Submission Checklist

- [ ] GitHub repository is **public**
- [ ] README contains live Vercel URL
- [ ] README contains local setup instructions
- [ ] All 6 `docs/` files committed to repository
- [ ] No `.env` files committed (`.gitignore` checked)
- [ ] Production smoke tests passed (Phase 5.6)
- [ ] Demo video recorded (optional but recommended — screen-record two browser windows collaborating in real time)
- [ ] Submit GitHub link to Lavish Health Care Private Limited by **19 May 2026**

---

> **Remember:** Evaluators will judge code quality, project structure, real-time feature implementation, and documentation. The live deployment and the `docs/` folder are what will make this submission stand out. Ship it. ✓

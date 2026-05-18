# Cowrite
### Real-Time Collaborative Notes Platform

![Live Demo](https://img.shields.io/badge/Live_Demo-cowrite--chi.vercel.app-C4785A?style=for-the-badge&logo=vercel) ![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase) ![Assignment](https://img.shields.io/badge/LHCPL--SE--2026--3429-Fresher_Assignment-blue?style=for-the-badge)

> A full-stack web application where multiple users can create, share, and edit notes together — with changes appearing instantly for all collaborators without refreshing the page.

**[🚀 View Live Demo →](https://cowrite-chi.vercel.app)**

## 🔑 Demo Accounts for Evaluators

Use these pre-configured accounts to test every feature instantly:

| Role | Email | Password |
|------|-------|----------|
| **Owner (Alex)** | alex.cowrite.test@gmail.com | Cowrite@Test1 |
| **Collaborator (Jordan)** | jordan.cowrite.test@gmail.com | Cowrite@Test2 |

These accounts already have shared notes set up and ready to demonstrate real-time collaboration.

## ⚡ Testing Real-Time Collaboration (2 minutes)

1. Open https://cowrite-chi.vercel.app in Chrome
2. Login as Alex (Account A credentials above)
3. Open an Incognito window → same URL
4. Login as Jordan (Account B credentials)
5. Alex: click "Shared Workspace" note
6. Jordan: open the same "Shared Workspace" note
7. Type anything in Alex's window
8. Watch it appear in Jordan's window LIVE ✨ (no refresh needed)
9. Try the reverse — Jordan types, Alex sees it
10. Open "Meeting Notes" as Jordan → notice it's read-only (Viewer permission)

This demonstrates: Auth ✓ Real-time sync ✓ Permissions ✓ Sharing ✓

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│         Next.js 14 (React + TypeScript)         │
└──────────────┬──────────────┬───────────────────┘
               │ REST API     │ WebSocket (WSS)
               ▼              ▼
┌─────────────────────────────────────────────────┐
│              RENDER (Persistent Server)          │
│         Node.js + Express.js + Socket.IO         │
│                                                  │
│  REST: Auth, CRUD, Sharing                       │
│  WS:   Rooms, send-changes, receive-changes      │
└──────────────────────┬──────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────┐
│           SUPABASE (PostgreSQL)                  │
│     Users │ Notes │ NoteShares (Viewer/Editor)  │
└─────────────────────────────────────────────────┘
```

Vercel uses serverless functions that terminate after each request. WebSocket connections require a persistent, long-lived TCP connection that serverless functions cannot maintain. Therefore the Express + Socket.IO backend is deployed on Render as a persistent Web Service, while the Next.js frontend lives on Vercel. This split deployment is intentional and production-correct.

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Authentication | JWT-based signup/login/logout |
| 📝 Notes CRUD | Create, edit, delete, search notes |
| ⚡ Real-Time Sync | Socket.IO rooms, sub-200ms latency |
| 👥 Sharing | Share by email with role assignment |
| 🔒 Permissions | Editor (read-write) / Viewer (read-only) |
| 🎨 Rich UI | Warm glassmorphism, DM Serif Display font |
| 🖊️ Doodle Pad | Freehand sketches embedded in notes |
| 💾 Auto-save | Debounced save every 1.5s |
| 📱 Responsive | Works on mobile, tablet, desktop |
| 🌐 Live Deploy | Vercel + Render + Supabase |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Real-Time | Socket.IO Client 4.x |
| HTTP Client | Axios |
| Backend Runtime | Node.js 18+ |
| Backend Framework | Express.js 4.x |
| WebSocket Server | Socket.IO 4.x |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5.x |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| DB Hosting | Supabase |

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Supabase account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/cowrite.git
cd cowrite
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
FRONTEND_URL=http://localhost:3000
PORT=5000
```

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

### 4. Open the app
Visit http://localhost:3000

## 📁 Project Structure

```
cowrite/
├── frontend/                 # Next.js app (Vercel)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   └── notes/[noteId]/
│   ├── components/
│   │   ├── ui/               # Button, Input primitives
│   │   ├── NoteCard.tsx
│   │   ├── ShareModal.tsx
│   │   └── Navbar.tsx
│   └── lib/
│       ├── socket.ts         # Socket.IO client
│       └── api.ts            # Axios instance
├── backend/                  # Express app (Render)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── notes.ts
│   │   │   └── users.ts
│   │   ├── socket/
│   │   │   └── noteHandlers.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma
└── docs/                     # Architecture documentation
    ├── PRD.md
    ├── APP_FLOW.md
    ├── TECH_STACK.md
    ├── FRONTEND_GUIDELINES.md
    ├── BACKEND_STRUCTURE.md
    └── IMPLEMENTATION_PLAN.md
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | Public | Register user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/notes | Required | Get own notes |
| POST | /api/notes | Required | Create note |
| PATCH | /api/notes/:id | Required | Update note |
| DELETE | /api/notes/:id | Required | Delete note |
| POST | /api/notes/:id/share | Required | Share note |
| GET | /api/notes/shared | Required | Get shared notes |

## ⚡ Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| join-note | Client → Server | Join note room |
| leave-note | Client → Server | Leave note room |
| send-changes | Client → Server | Broadcast content |
| receive-changes | Server → Client | Receive updates |

## 👨‍💻 About

Built by **Saumok Kundu** as a fresher full-stack assignment for **Lavish Health Care Private Limited**

Project ID: `LHCPL-SE-2026-3429`

---

*Built with ❤️ and lots of ☕*

# Real-Time Collaborative Notes Platform

> **Live Demo:** (Deploy to get URL)

A full-stack collaborative note-taking application built for Lavish Health Care Private Limited. Multiple users can edit the same note simultaneously with changes syncing in real-time via Socket.IO.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                      │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS + WSS
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
┌─────────────────┐           ┌──────────────────────┐
│  VERCEL         │           │  RENDER               │
│  Next.js 14     │  REST API  │  Node.js / Express   │
│  (Serverless)   │ ◄────────► │  + Socket.IO         │
│                 │           │  (Persistent Process) │
└─────────────────┘           └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  SUPABASE / RENDER   │
                              │  PostgreSQL Database │
                              └──────────────────────┘
```

**Split deployment architecture:** Vercel handles the Next.js frontend (serverless), while Render runs a persistent Node.js process for Socket.IO WebSocket connections. This is necessary because serverless functions cannot maintain long-lived WebSocket connections.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling with dark mode
- **Socket.IO Client** - Real-time WebSocket communication
- **Axios** - HTTP client for REST API
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - REST API framework
- **Socket.IO** - WebSocket server for real-time collaboration
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## ✨ Key Features

- ✅ **JWT Authentication** - Secure signup/login with token-based auth
- ✅ **Real-Time Collaboration** - Multiple users can edit notes simultaneously
- ✅ **Live Presence** - See who's currently viewing/editing a note
- ✅ **Typing Indicators** - Know when collaborators are typing
- ✅ **Granular Permissions** - Share notes as Viewer (read-only) or Editor (read-write)
- ✅ **Auto-Save** - Debounced automatic saving every 2 seconds
- ✅ **Socket Reconnection** - Automatic reconnection with exponential backoff
- ✅ **Dark Mode UI** - Beautiful dark theme with electric blue accents
- ✅ **Optimistic UI** - Instant local updates before server confirmation

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** (local installation or Supabase account)
- **npm** or **yarn**

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collaborative-notes.git
cd collaborative-notes
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and set your values:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# - FRONTEND_URL: http://localhost:3000
# - PORT: 5000

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Test the Application

1. Open `http://localhost:3000` in your browser
2. Sign up for a new account
3. Create a note
4. Open the same note in an incognito window with a different account
5. Type in one window and watch it appear in the other in real-time!

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  notes     Note[]
  sharedNotes NoteShare[]
}

model Note {
  id        String   @id @default(cuid())
  title     String   @default("Untitled Note")
  content   String   @default("")
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  shares    NoteShare[]
}

model NoteShare {
  id        String   @id @default(cuid())
  role      Role     @default(VIEWER)
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([noteId, userId])
}

enum Role {
  VIEWER
  EDITOR
}
```

## 🚢 Production Deployment

### Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection String**
3. Copy the connection string (Transaction mode)
4. Use this as `DATABASE_URL` in Render

### Backend (Render)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory:** `backend`
4. Set **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
5. Set **Start Command:** `npm start`
6. Add environment variables:
   - `DATABASE_URL` - From Supabase
   - `JWT_SECRET` - Generate a secure random string
   - `FRONTEND_URL` - Your Vercel URL (update after deploying frontend)
   - `NODE_ENV` - `production`
   - `PORT` - `5000`
7. Deploy and note the Render URL

### Frontend (Vercel)

1. Create a new project on [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory:** `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_BACKEND_URL` - Your Render backend URL
5. Deploy and note the Vercel URL

### Update CORS

Go back to Render → Environment Variables → Update `FRONTEND_URL` to your Vercel URL. Render will auto-redeploy.

## 📁 Project Structure

```
collaborative-notes/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication endpoints
│   │   │   ├── notes.ts         # Note CRUD + sharing
│   │   │   └── users.ts         # User search
│   │   ├── socket/
│   │   │   └── noteHandlers.ts  # Socket.IO event handlers
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT verification
│   │   ├── prisma/
│   │   │   └── client.ts        # Prisma singleton
│   │   └── index.ts             # Express + Socket.IO server
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Signup page
│   │   ├── dashboard/           # Notes dashboard
│   │   ├── notes/[noteId]/      # Note editor
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── NoteCard.tsx
│   │   ├── ShareModal.tsx
│   │   ├── CollaboratorIndicator.tsx
│   │   └── SocketStatusBadge.tsx
│   ├── hooks/
│   │   └── useAuth.ts           # Authentication hook
│   ├── lib/
│   │   ├── api.ts               # Axios instance
│   │   ├── socket.ts            # Socket.IO client
│   │   └── utils.ts             # Helper functions
│   └── types/
│       └── index.ts             # TypeScript types
└── docs/                        # Project documentation
```

## 🔒 Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Authentication:** 7-day token expiry
- **CORS Protection:** Whitelist-based origin validation
- **Rate Limiting:** 100 requests per 15 minutes on auth routes
- **Helmet.js:** Secure HTTP headers
- **SQL Injection Prevention:** Prisma's parameterized queries
- **Socket Authentication:** JWT verification on WebSocket connections

## 🎨 Design System

- **Dark Mode:** Deep slate backgrounds with electric blue accents
- **Typography:** Inter for UI, JetBrains Mono for code
- **Colors:**
  - Background: `#0f1117` → `#1a1d27` → `#242736`
  - Accent: `#3b82f6` (Electric Blue)
  - Success: `#22c55e`
  - Warning: `#f59e0b`
  - Error: `#ef4444`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user

### Notes
- `GET /api/notes` - Get user's notes
- `GET /api/notes/shared` - Get notes shared with user
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get single note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note (owner only)

### Sharing
- `POST /api/notes/:id/share` - Share note with user
- `DELETE /api/notes/:id/share/:userId` - Revoke access
- `GET /api/notes/:id/shares` - List collaborators

### Socket Events
- `join-note` - Join note collaboration room
- `leave-note` - Leave note room
- `send-changes` - Broadcast content changes
- `receive-changes` - Receive remote changes
- `typing-start` / `typing-stop` - Typing indicators
- `room-users` - Active collaborators list

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Run `npx prisma generate` and `npx prisma migrate dev`

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check browser console for CORS errors

### Socket connection fails
- Ensure JWT token is valid (check localStorage)
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser network tab for WebSocket connection

## 📄 License

This project was created as an assignment for Lavish Health Care Private Limited.

## 👤 Author

**Saumok Kundu**  
Project ID: LHCPL-SE-2026-3429  
Date: May 17, 2026

---

Built with ❤️ using Next.js, Express, Socket.IO, and PostgreSQL

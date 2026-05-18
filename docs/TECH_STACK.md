# TECH_STACK.md — Technology Stack Documentation

**Project:** Real-Time Collaborative Notes Platform
**Owner:** Saumok Kundu | LHCPL-SE-2026-3429

---

## 1. Stack Overview

This project uses a **split deployment architecture** to correctly handle persistent WebSocket connections — a constraint that standard serverless platforms cannot satisfy.

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

**Why split?** Vercel functions are stateless and terminate idle connections. Socket.IO requires a long-lived TCP connection. Render runs a persistent Node.js process that maintains WebSocket connections indefinitely.

---

## 2. Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.x (App Router) | React framework, SSR, file-based routing, API routes (auth only) |
| **TypeScript** | 5.x | Type safety across components, API types, socket event types |
| **Tailwind CSS** | 3.x | Utility-first CSS, dark mode via `dark:` variant, responsive design |
| **socket.io-client** | 4.x | WebSocket client connecting to Render backend |
| **axios** | 1.x | HTTP client for REST API calls to backend |
| **react-hot-toast** | 2.x | Non-intrusive toast notifications |

### Key Frontend Directories

```
/frontend (or root for Next.js project)
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── notes/[noteId]/page.tsx
│   └── layout.tsx
├── components/
│   ├── NoteCard.tsx
│   ├── NoteEditor.tsx
│   ├── ShareModal.tsx
│   ├── CollaboratorIndicator.tsx
│   └── SocketStatusBadge.tsx
├── hooks/
│   ├── useSocket.ts
│   └── useAuth.ts
├── lib/
│   ├── api.ts          (axios instance with base URL + JWT interceptor)
│   └── socket.ts       (singleton socket.io-client instance)
└── types/
    └── index.ts        (Note, User, SharePermission, SocketEvents types)
```

---

## 3. Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18.x+ | Runtime |
| **Express.js** | 4.x | REST API framework |
| **Socket.IO** | 4.x | WebSocket server, room management, event broadcasting |
| **jsonwebtoken** | 9.x | JWT signing and verification |
| **bcryptjs** | 2.x | Password hashing |
| **cors** | 2.x | CORS middleware — whitelists Vercel domain |
| **dotenv** | 16.x | Environment variable loading |

### Key Backend Directories

```
/backend
├── src/
│   ├── index.ts            (Express app + Socket.IO server init)
│   ├── routes/
│   │   ├── auth.ts         (POST /signup, POST /login)
│   │   ├── notes.ts        (CRUD + sharing endpoints)
│   │   └── users.ts        (GET /users/search for share modal)
│   ├── middleware/
│   │   └── auth.ts         (JWT verification middleware)
│   ├── socket/
│   │   └── noteHandlers.ts (join-note, leave-note, send-changes logic)
│   ├── prisma/
│   │   └── client.ts       (Prisma client singleton)
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```

---

## 4. Database Stack

| Technology | Version | Purpose |
|---|---|---|
| **PostgreSQL** | 15.x | Relational database — hosted on Supabase or Render Postgres |
| **Prisma ORM** | 5.x | Type-safe DB client, schema management, migrations |

### Hosting Options (choose one)

| Provider | Free Tier | Notes |
|---|---|---|
| **Supabase** | 500MB, 2 projects | Recommended — generous free tier, easy setup |
| **Render Postgres** | 1GB (90-day free) | Convenient if backend is also on Render |

---

## 5. DevOps & Infrastructure

### Frontend — Vercel

1. Connect GitHub repo to Vercel project.
2. Set **Root Directory** to `/frontend` (if monorepo).
3. Set **Build Command:** `npm run build`
4. Set **Output Directory:** `.next`
5. Add environment variable: `NEXT_PUBLIC_BACKEND_URL=https://<your-render-app>.onrender.com`
6. Every push to `main` branch triggers automatic redeploy.

### Backend — Render

1. Create a new **Web Service** on Render.
2. Connect GitHub repo, set **Root Directory** to `/backend`.
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `npm start`
5. Set **Environment:** Node
6. Add all required environment variables (see Section 6).
7. Enable **Health Check Path:** `/health` (add a simple GET `/health` → 200 OK route).

> **Important:** Render free tier spins down after 15 minutes of inactivity. For the assignment demo, this is acceptable. The Socket.IO client's reconnection logic handles the cold-start reconnect automatically.

### Database — Supabase

1. Create project at supabase.com.
2. Copy the **Connection String** (Transaction mode / Pooler) from Settings → Database.
3. Use this as `DATABASE_URL` in Render environment variables.
4. Run `npx prisma migrate deploy` as part of the Render build command.

---

## 6. Environment Variables

### Frontend (`/frontend/.env.local`)

```env
# URL of the deployed Render backend (no trailing slash)
NEXT_PUBLIC_BACKEND_URL=https://<your-app>.onrender.com
```

### Backend (`/backend/.env`)

```env
# PostgreSQL connection string from Supabase or Render
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# JWT signing secret — use a long random string (openssl rand -base64 64)
JWT_SECRET=your_super_secret_jwt_key_here

# Exact Vercel production URL — used for CORS whitelist
FRONTEND_URL=https://<your-project>.vercel.app

# Server port
PORT=5000

# Node environment
NODE_ENV=production
```

> **Never commit `.env` files to Git.** Add both to `.gitignore`.

---

## 7. Package.json Scripts

### Frontend (`/frontend/package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Backend (`/backend/package.json`)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

> Render runs `npm install && npm run build` then `npm start`. The `build` command compiles TypeScript to `/dist`. The `start` command runs the compiled JS. **Both scripts are mandatory for Render deployment.**

---

## 8. Security Considerations

### CORS Configuration (Critical for Split Deployment)

The Express backend must be configured to **only accept requests from the Vercel production domain**. A misconfigured CORS policy (`origin: "*"`) would allow any domain to call your API.

```typescript
// backend/src/index.ts

import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL!,           // e.g. https://my-notes.vercel.app
  'http://localhost:3000',              // local dev only
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,                   // required if using cookies
}));

// Socket.IO CORS — must mirror Express config
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### Additional Security Measures

| Measure | Implementation |
|---|---|
| Password storage | `bcryptjs` with salt rounds = 12 |
| JWT expiry | Set `expiresIn: '7d'` — refresh token pattern out of scope |
| JWT on Socket.IO | Verify JWT in `io.use()` middleware before allowing socket events |
| SQL injection | Prisma's parameterized queries prevent injection by default |
| Rate limiting | `express-rate-limit` on `/api/auth/*` routes (100 req/15min) |
| Helmet.js | `helmet()` middleware sets secure HTTP headers |
| `.env` in `.gitignore` | Never expose secrets in version control |

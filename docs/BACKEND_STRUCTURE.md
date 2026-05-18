# BACKEND_STRUCTURE.md — Database & API Blueprint

**Project:** Real-Time Collaborative Notes Platform
**Owner:** Saumok Kundu | LHCPL-SE-2026-3429

---

## 1. Architecture Overview

The backend is a **single persistent Node.js process** deployed on Render as a Web Service. It combines two servers on one HTTP port:

```
┌────────────────────────────────────────────────────┐
│               Render Web Service                   │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  http.createServer(expressApp)               │  │
│  │                                              │  │
│  │  ┌─────────────────┐  ┌───────────────────┐  │  │
│  │  │  Express REST   │  │   Socket.IO        │  │  │
│  │  │  /api/*         │  │   attached to      │  │  │
│  │  │  Auth, CRUD,    │  │   same httpServer  │  │  │
│  │  │  Sharing        │  │   ws://...         │  │  │
│  │  └────────┬────────┘  └────────┬──────────┘  │  │
│  │           │                    │              │  │
│  └───────────┼────────────────────┼──────────────┘  │
│              │                    │                  │
│              ▼                    ▼                  │
│         ┌─────────────────────────────┐             │
│         │   Prisma Client             │             │
│         │   PostgreSQL (Supabase)     │             │
│         └─────────────────────────────┘             │
└────────────────────────────────────────────────────┘
```

Both Express and Socket.IO share the same `http.Server` instance — this is the correct pattern for running them on a single port.

---

## 2. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  notes     Note[]          // Notes owned by this user
  sharedNotes NoteShare[]   // Notes shared with this user
}

model Note {
  id        String   @id @default(cuid())
  title     String   @default("Untitled Note")
  content   String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  shares    NoteShare[]

  @@index([ownerId])
}

model NoteShare {
  id        String   @id @default(cuid())
  role      Role     @default(VIEWER)
  createdAt DateTime @default(now())

  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([noteId, userId])   // One share record per user per note
  @@index([userId])
}

enum Role {
  VIEWER
  EDITOR
}
```

---

## 3. API Endpoints

### Base URL (production): `https://<your-app>.onrender.com`

All protected routes require `Authorization: Bearer <jwt>` header.

---

#### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new user. Returns `{ token, user }` |
| POST | `/api/auth/login` | Public | Authenticate user. Returns `{ token, user }` |

**POST `/api/auth/signup`**
```json
// Request body
{ "name": "Saumok Kundu", "email": "saumok@example.com", "password": "secure123" }

// Response 201
{ "token": "<jwt>", "user": { "id": "...", "name": "Saumok Kundu", "email": "..." } }
```

**POST `/api/auth/login`**
```json
// Request body
{ "email": "saumok@example.com", "password": "secure123" }

// Response 200
{ "token": "<jwt>", "user": { "id": "...", "name": "Saumok Kundu", "email": "..." } }
```

---

#### Notes (all protected)

| Method | Path | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes owned by the authenticated user |
| GET | `/api/notes/shared` | Get all notes shared with the authenticated user |
| POST | `/api/notes` | Create a new note (owner = current user) |
| GET | `/api/notes/:id` | Get a single note (must be owner or have NoteShare record) |
| PATCH | `/api/notes/:id` | Update note title/content (must be owner or EDITOR) |
| DELETE | `/api/notes/:id` | Delete note (owner only) |

**GET `/api/notes`** — Response 200
```json
[
  {
    "id": "clx...",
    "title": "Meeting Notes",
    "content": "...",
    "updatedAt": "2026-05-17T10:00:00Z",
    "shares": [{ "userId": "...", "role": "EDITOR" }]
  }
]
```

**POST `/api/notes`** — Request / Response 201
```json
// Request (body is optional — defaults used if empty)
{ "title": "New Note", "content": "" }

// Response
{ "id": "clx...", "title": "New Note", "content": "", "ownerId": "...", ... }
```

**PATCH `/api/notes/:id`**
```json
// Request (send only changed fields)
{ "title": "Updated Title", "content": "Updated content..." }

// Response 200
{ "id": "clx...", "title": "Updated Title", "content": "...", "updatedAt": "..." }
```

---

#### Sharing

| Method | Path | Description |
|---|---|---|
| POST | `/api/notes/:id/share` | Share note with a user by email |
| DELETE | `/api/notes/:id/share/:userId` | Revoke a user's access to the note |
| GET | `/api/notes/:id/shares` | List all share records for a note |

**POST `/api/notes/:id/share`**
```json
// Request
{ "email": "collaborator@example.com", "role": "EDITOR" }

// Response 201
{ "id": "...", "noteId": "...", "userId": "...", "role": "EDITOR" }

// Error 404 if user not found
{ "error": "User with that email not found" }
```

---

#### Users

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/search?q=email` | Search users by email (for share modal autocomplete) |
| GET | `/api/users/me` | Get current authenticated user profile |

---

#### Health Check

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{ status: "ok" }` — used by Render health check |

---

## 4. Socket Events Blueprint

### Connection & Authentication

```typescript
// backend/src/index.ts

// Authenticate socket connection using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    socket.data.userId = payload.userId;
    socket.data.userName = payload.name;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});
```

---

### Event Reference

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-note` | `{ noteId: string }` | Client requests to join a note's collaboration room |
| `leave-note` | `{ noteId: string }` | Client leaves the note room (navigates away) |
| `send-changes` | `{ noteId: string, content: string }` | Client broadcasts its current note content to the room |
| `typing-start` | `{ noteId: string }` | Notifies room that this user started typing |
| `typing-stop` | `{ noteId: string }` | Notifies room that this user stopped typing |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `receive-changes` | `{ content: string, userId: string }` | Broadcast to all room members except sender with latest content |
| `room-users` | `{ users: { userId, userName }[] }` | Sent to all in room when someone joins or leaves |
| `user-typing` | `{ userId: string, userName: string }` | Broadcast when a user emits `typing-start` |
| `user-stopped-typing` | `{ userId: string }` | Broadcast when a user emits `typing-stop` |
| `error` | `{ message: string }` | Sent to individual socket on permission/auth errors |

---

### Handler Implementation

```typescript
// backend/src/socket/noteHandlers.ts

import { Server, Socket } from 'socket.io';
import prisma from '../prisma/client';

export function registerNoteHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // JOIN NOTE ROOM
  socket.on('join-note', async ({ noteId }: { noteId: string }) => {
    // Verify user has access to this note
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        OR: [
          { ownerId: userId },
          { shares: { some: { userId } } },
        ],
      },
    });

    if (!note) {
      socket.emit('error', { message: 'Access denied to this note' });
      return;
    }

    const room = `note-${noteId}`;
    socket.join(room);

    // Broadcast updated user list to entire room
    const socketsInRoom = await io.in(room).fetchSockets();
    const users = socketsInRoom.map(s => ({
      userId: s.data.userId,
      userName: s.data.userName,
    }));
    io.to(room).emit('room-users', { users });
  });

  // SEND CHANGES (broadcast content delta to all others in room)
  socket.on('send-changes', async ({ noteId, content }: { noteId: string; content: string }) => {
    // Verify editor permission
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        OR: [
          { ownerId: userId },
          { shares: { some: { userId, role: 'EDITOR' } } },
        ],
      },
    });

    if (!note) {
      socket.emit('error', { message: 'Edit permission required' });
      return;
    }

    const room = `note-${noteId}`;
    // Broadcast to everyone in room EXCEPT the sender
    socket.to(room).emit('receive-changes', { content, userId });
  });

  // TYPING INDICATORS
  socket.on('typing-start', ({ noteId }: { noteId: string }) => {
    socket.to(`note-${noteId}`).emit('user-typing', {
      userId,
      userName: socket.data.userName,
    });
  });

  socket.on('typing-stop', ({ noteId }: { noteId: string }) => {
    socket.to(`note-${noteId}`).emit('user-stopped-typing', { userId });
  });

  // LEAVE NOTE ROOM
  socket.on('leave-note', async ({ noteId }: { noteId: string }) => {
    const room = `note-${noteId}`;
    socket.leave(room);

    const socketsInRoom = await io.in(room).fetchSockets();
    const users = socketsInRoom.map(s => ({
      userId: s.data.userId,
      userName: s.data.userName,
    }));
    io.to(room).emit('room-users', { users });
  });

  // DISCONNECT — clean up all rooms
  socket.on('disconnect', async () => {
    const rooms = Array.from(socket.rooms).filter(r => r.startsWith('note-'));
    for (const room of rooms) {
      const socketsInRoom = await io.in(room).fetchSockets();
      const users = socketsInRoom.map(s => ({
        userId: s.data.userId,
        userName: s.data.userName,
      }));
      io.to(room).emit('room-users', { users });
    }
  });
}
```

---

## 5. Production Readiness

### CORS Configuration

```typescript
// backend/src/index.ts — complete setup

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL!,   // https://<project>.vercel.app
  'http://localhost:3000',
];

// HTTP CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Security headers
app.use(helmet());

// Rate limiting on auth routes
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Socket.IO with matching CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Ping/pong heartbeat — keeps Render connections alive
  pingTimeout: 60000,   // 60s: time to wait for pong before closing
  pingInterval: 25000,  // 25s: how often to send ping
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
```

### Ping/Pong Heartbeat

The `pingInterval` and `pingTimeout` values above ensure that Render's infrastructure does not close idle WebSocket connections prematurely. The Socket.IO server sends a ping every 25 seconds; if no pong is received within 60 seconds, the connection is considered dead and the client triggers its reconnection logic.

### Client-Side Reconnection

```typescript
// frontend/lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
  auth: { token: localStorage.getItem('token') },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,   // Max 10s between attempts
  randomizationFactor: 0.5,
  autoConnect: false,            // Connect manually when entering note editor
});
```

### Migration on Deploy

Add to Render's Build Command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

This ensures the database schema is always up to date before the server starts.

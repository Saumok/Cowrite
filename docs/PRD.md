# PRD.md — Product Requirements Document

**Title:** Real-Time Collaborative Notes Platform
**Version:** 1.0.0
**Owner:** Saumok Kundu
**Project ID:** LHCPL-SE-2026-3429
**Organization:** Lavish Health Care Private Limited
**Date:** 17 May 2026

---

## 1. Product Overview

A full-stack web application that enables multiple users to create, edit, and collaborate on notes in real time. Changes made by any collaborator are broadcast instantly to all other connected users — no page refresh required. The platform is deployed live using a split architecture: Next.js frontend on Vercel, and a persistent Express/Socket.IO backend on Render, backed by a hosted PostgreSQL database.

---

## 2. Problem Statement

Conventional note-taking applications are single-user by nature. When teams attempt to collaborate on notes, they face:

- **Stale data:** Users must manually refresh to see another person's changes.
- **No presence awareness:** No indication of who else is viewing or editing a note.
- **No granular permissions:** Notes are either fully public or fully private with no sharing model.

This project directly addresses these gaps by implementing a WebSocket-based real-time sync engine on top of a standard REST CRUD platform.

---

## 3. Goals & Objectives

| Goal | Description |
|---|---|
| **Seamless Collaboration** | Multiple users can open the same note and see each other's edits character-by-character. |
| **Zero-Refresh Updates** | All note content changes are pushed via Socket.IO rooms — no polling or page reload. |
| **Secure Auth** | JWT-based authentication guards all REST and Socket connections. |
| **Granular Permissions** | Note owners can share notes as Viewer (read-only) or Editor (read-write). |
| **Live Deployment** | The application is publicly accessible at a Vercel URL, demonstrating production readiness beyond localhost. |
| **Production Architecture** | The split Vercel + Render deployment proves understanding of WebSocket constraints in serverless environments. |

---

## 4. Success Metrics

| Metric | Target |
|---|---|
| Socket event round-trip latency | < 100ms under normal network conditions |
| Frontend availability (Vercel) | 100% uptime (Vercel SLA) |
| Backend availability (Render) | ≥ 99% uptime |
| Auth response time | < 300ms |
| Note CRUD API response time | < 500ms |
| Simultaneous collaborators per note (tested) | ≥ 3 users |
| Zero data loss on disconnect/reconnect | Socket.IO reconnection logic must restore room state |

---

## 5. Target Users & Personas

**Persona 1 — The Student Collaborator**
- Age: 18–24
- Needs: Share lecture notes with classmates and edit together in real time.
- Pain point: Google Docs is heavy; wants a minimal, distraction-free alternative.

**Persona 2 — The Remote Team Member**
- Age: 25–40
- Needs: Quickly jot down meeting notes and have teammates see them live.
- Pain point: Email threads and copy-paste workflows create version confusion.

**Persona 3 — The Solo Power User**
- Age: Any
- Needs: Organize personal notes, search/filter them, and occasionally share read-only links.
- Pain point: Wants a clean dark-mode interface without bloated features.

---

## 6. Features & Requirements

### P0 — Must Have (Core)

| Feature | Description |
|---|---|
| **User Authentication** | Signup, Login, Logout using email/password. JWT stored in httpOnly cookie or localStorage. |
| **Note CRUD** | Create, Read, Update, Delete notes. Each note has a title and body. |
| **Real-Time Collaboration** | Socket.IO rooms scoped to `noteId`. `send-changes` and `receive-changes` events sync content instantly. |
| **Sharing & Permissions** | Owner can share a note with another user by email, assigning Viewer or Editor role. |
| **Dashboard** | Displays user's own notes + notes shared with them. Filterable tabs. |
| **Search** | Client-side or server-side search across note titles and content. |

### P1 — Should Have (High Value)

| Feature | Description |
|---|---|
| **Dark Mode UI** | Deep slate background with electric blue accents — default theme. |
| **Live Demo Deployment** | Public Vercel URL submitted with the assignment. |
| **Auto-save** | Debounced save triggered on content change (avoids excessive API calls). |
| **Typing Indicator** | Show avatar/name of collaborators currently typing. |
| **Socket Reconnection** | Exponential back-off reconnection to Render backend on network interruption. |

### P2 — Nice to Have (Stretch)

| Feature | Description |
|---|---|
| Markdown editor | Preview rendered Markdown alongside raw text. |
| Docker setup | `docker-compose.yml` for local reproducibility. |
| Demo video | Screen recording walkthrough of real-time collaboration. |

---

## 7. Out of Scope

The following are explicitly **not** part of this assignment:

- Rich-text / WYSIWYG formatting (Bold, Italic, tables, embedded images in notes)
- Billing, subscription tiers, or payment integration
- Mobile native apps (iOS / Android)
- Local-only / offline-only setup as the primary deliverable
- End-to-end encryption of note contents
- Version history or conflict resolution (OT/CRDT)
- OAuth / social login (Google, GitHub)
- Email notifications

---

## 8. User Scenarios

**Scenario A — New User Onboarding**
> Priya visits the live Vercel URL → clicks Sign Up → enters email & password → is redirected to her empty Dashboard → creates her first note.

**Scenario B — Real-Time Collaboration**
> Rohan opens Note #42. Priya (who owns the note) has already shared it as Editor. Both users have the note open simultaneously. Rohan types "Hello" — Priya sees "Hello" appear in her editor within milliseconds, with no refresh.

**Scenario C — Viewer Permission Enforcement**
> Priya shares Note #42 with Dev as Viewer. Dev opens the note — the editor area is read-only. The Share and Delete buttons are hidden. Dev cannot emit `send-changes` events.

**Scenario D — Disconnect & Reconnect**
> Rohan's laptop sleeps mid-session. Socket.IO client detects disconnection and begins reconnection attempts. On wake, it reconnects to the Render server, rejoins the note room, and fetches the latest note state from the REST API as a reconciliation step.

---

## 9. Dependencies & Constraints

| Constraint | Detail |
|---|---|
| **Deadline** | 3 days — submission by **19 May 2026** |
| **WebSocket & Serverless** | Vercel serverless functions terminate idle connections; therefore the Socket.IO server **must** be deployed on a persistent process (Render or Railway). |
| **CORS** | Express backend must whitelist exactly the Vercel production domain (`FRONTEND_URL` env var) to prevent unauthorized cross-origin requests. |
| **Environment Secrets** | `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` must never be committed to Git. Use `.env` locally and platform env vars in production. |
| **Database** | Supabase Postgres or Render Postgres (managed, no self-hosted requirement). |
| **Node.js Version** | ≥ 18.x required for Next.js 14+ and modern ESM compatibility. |

---

## 10. Timeline & Milestones

| Day | Phase | Deliverables |
|---|---|---|
| **Day 1 (17 May)** | Foundation + Auth + DB | Monorepo scaffold, Prisma schema, JWT auth endpoints, basic REST CRUD |
| **Day 2 (18 May)** | Real-Time Engine + UI | Socket.IO rooms, `send/receive-changes`, Dashboard UI, Note Editor UI |
| **Day 3 (19 May)** | Deployment + Polish | CORS config, env vars, deploy DB → Render backend → Vercel frontend, README, submission |

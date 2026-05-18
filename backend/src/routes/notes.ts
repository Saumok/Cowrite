import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/notes - Get all notes owned by user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { ownerId: req.user!.userId },
      include: {
        shares: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notes/shared - Get all notes shared with user
router.get('/shared', async (req: AuthRequest, res) => {
  try {
    const sharedNotes = await prisma.noteShare.findMany({
      where: { userId: req.user!.userId },
      include: {
        note: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
            shares: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { note: { updatedAt: 'desc' } },
    });

    res.json(sharedNotes.map(share => ({ ...share.note, myRole: share.role })));
  } catch (error) {
    console.error('Get shared notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes - Create new note
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;

    const note = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        content: content || '',
        ownerId: req.user!.userId,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user!.userId },
          { shares: { some: { userId: req.user!.userId } } },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      return res.status(403).json({ error: 'Access denied to this note' });
    }

    // Determine user's role
    const isOwner = note.ownerId === req.user!.userId;
    const share = note.shares?.find((s: any) => s.userId === req.user!.userId);
    const myRole = isOwner ? 'OWNER' : share?.role || 'VIEWER';

    res.json({ ...note, myRole });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notes/:id - Update note
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { title, content } = req.body;

    // Verify user has edit permission
    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user!.userId },
          { shares: { some: { userId: req.user!.userId, role: 'EDITOR' } } },
        ],
      },
    });

    if (!note) {
      return res.status(403).json({ error: 'Edit permission required' });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id - Delete note (owner only)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const note = await prisma.note.findFirst({
      where: { id, ownerId: req.user!.userId },
    });

    if (!note) {
      return res.status(403).json({ error: 'Only the owner can delete this note' });
    }

    await prisma.note.delete({ where: { id } });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes/:id/share - Share note with user
router.post('/:id/share', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Verify user is owner
    const note = await prisma.note.findFirst({
      where: { id, ownerId: req.user!.userId },
    });

    if (!note) {
      return res.status(403).json({ error: 'Only the owner can share this note' });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User with that email not found' });
    }

    // Prevent sharing with self
    if (targetUser.id === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot share note with yourself' });
    }

    // Upsert share
    const share = await prisma.noteShare.upsert({
      where: {
        noteId_userId: {
          noteId: id,
          userId: targetUser.id,
        },
      },
      update: { role },
      create: {
        noteId: id,
        userId: targetUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(share);
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id/share/:userId - Revoke share
router.delete('/:id/share/:userId', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const userId = req.params.userId as string;

    // Verify user is owner
    const note = await prisma.note.findFirst({
      where: { id, ownerId: req.user!.userId },
    });

    if (!note) {
      return res.status(403).json({ error: 'Only the owner can revoke shares' });
    }

    await prisma.noteShare.deleteMany({
      where: { noteId: id, userId },
    });

    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notes/:id/shares - Get all shares for a note
router.get('/:id/shares', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    // Verify user has access
    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user!.userId },
          { shares: { some: { userId: req.user!.userId } } },
        ],
      },
    });

    if (!note) {
      return res.status(403).json({ error: 'Access denied to this note' });
    }

    const shares = await prisma.noteShare.findMany({
      where: { noteId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(shares);
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

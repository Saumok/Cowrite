import { Server, Socket } from 'socket.io';
import prisma from '../prisma/client';

export function registerNoteHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const userName = socket.data.userName;

  // JOIN NOTE ROOM
  socket.on('join-note', async ({ noteId }: { noteId: string }) => {
    try {
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
      console.log(`Socket ${socket.id} (${userName}) joined room: ${room}`);

      // Broadcast updated user list to entire room
      const socketsInRoom = await io.in(room).fetchSockets();
      const users = socketsInRoom.map(s => ({
        userId: s.data.userId,
        userName: s.data.userName,
      }));
      
      io.to(room).emit('room-users', { users });
    } catch (error) {
      console.error('Join note error:', error);
      socket.emit('error', { message: 'Failed to join note' });
    }
  });

  // SEND CHANGES (broadcast content to all others in room)
  socket.on('send-changes', async ({ noteId, content }: { noteId: string; content: string }) => {
    try {
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
      console.log(`Changes received for ${room} from ${userName}`);
      // Broadcast to everyone in room EXCEPT the sender
      socket.to(room).emit('receive-changes', { content, userId });
    } catch (error) {
      console.error('Send changes error:', error);
      socket.emit('error', { message: 'Failed to send changes' });
    }
  });

  // TYPING INDICATORS
  socket.on('typing-start', ({ noteId }: { noteId: string }) => {
    socket.to(`note-${noteId}`).emit('user-typing', {
      userId,
      userName,
    });
  });

  socket.on('typing-stop', ({ noteId }: { noteId: string }) => {
    socket.to(`note-${noteId}`).emit('user-stopped-typing', { userId });
  });

  // LEAVE NOTE ROOM
  socket.on('leave-note', async ({ noteId }: { noteId: string }) => {
    try {
      const room = `note-${noteId}`;
      socket.leave(room);

      const socketsInRoom = await io.in(room).fetchSockets();
      const users = socketsInRoom.map(s => ({
        userId: s.data.userId,
        userName: s.data.userName,
      }));
      
      io.to(room).emit('room-users', { users });
    } catch (error) {
      console.error('Leave note error:', error);
    }
  });

  // DISCONNECTING — clean up all rooms (runs BEFORE socket leaves rooms)
  socket.on('disconnecting', async () => {
    try {
      const rooms = Array.from(socket.rooms).filter(r => r.startsWith('note-'));
      
      for (const room of rooms) {
        const socketsInRoom = await io.in(room).fetchSockets();
        // Exclude the current socket since it is disconnecting
        const users = socketsInRoom
          .filter(s => s.id !== socket.id)
          .map(s => ({
            userId: s.data.userId,
            userName: s.data.userName,
          }));
        
        io.to(room).emit('room-users', { users });
        
        // Also emit user stopped typing to clean up any active indicators
        socket.to(room).emit('user-stopped-typing', { userId });
      }
    } catch (error) {
      console.error('Disconnecting cleanup error:', error);
    }
  });
}

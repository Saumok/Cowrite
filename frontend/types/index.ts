export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  shares?: NoteShare[];
  myRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
}

export interface NoteShare {
  id: string;
  noteId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR';
  user?: User;
  createdAt: string;
}

export interface Collaborator {
  userId: string;
  userName: string;
  color?: string;
}

export type SocketStatus = 'connected' | 'reconnecting' | 'disconnected';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

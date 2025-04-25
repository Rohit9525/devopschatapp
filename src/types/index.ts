export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  displayNameLower: string | null;
  photoURL: string | null;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  text: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice' | 'file';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  type: 'private' | 'group';
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: Date;
  };
  unreadCount: number;
  createdAt: Date;
  removed?: boolean;
  removedAt?: Date;
  removedBy?: string;
  groupInfo?: {
    id: string;
    name: string;
    photoURL: string;
    description: string;
  };
}

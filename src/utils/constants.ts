export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  GROUPS: 'groups',
  CALLS: 'calls',
  CHAT_ROOMS: 'chatRooms'
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  FILE: 'file'
} as const;

export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video'
} as const;

export const CALL_STATUS = {
  ONGOING: 'ongoing',
  ENDED: 'ended',
  MISSED: 'missed'
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

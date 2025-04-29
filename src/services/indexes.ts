import { db } from '../lib/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

// Chat room queries
export const getChatRoomsQuery = (userId: string) => {
  return query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
};

// Messages queries
export const getMessagesQuery = (roomId: string) => {
  return query(
    collection(db, `chatRooms/${roomId}/messages`),
    orderBy('timestamp', 'desc')
  );
};

// User queries
export const searchUsersQuery = (searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return query(
    collection(db, 'users'),
    where('displayName', '>=', term),
    where('displayName', '<=', term + '\uf8ff'),
    orderBy('displayName')
  );
};

// Group queries
export const getGroupsQuery = (userId: string) => {
  return query(
    collection(db, 'groups'),
    where('members', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
};

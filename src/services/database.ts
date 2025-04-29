import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  DocumentData,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../types';

// Collection references
const COLLECTIONS = {
  USERS: 'users',
  CHAT_ROOMS: 'chatRooms',
  GROUPS: 'groups'
} as const;

// User document operations
export const initializeUserDocument = async (user: User) => {
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  
  // Check if user document already exists
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    // Update last seen and online status
    await updateDoc(userRef, {
      lastSeen: serverTimestamp(),
      online: true
    });
    return;
  }

  // Create new user document
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    displayNameLower: user.displayName?.toLowerCase(), // For case-insensitive search
    photoURL: user.photoURL || 'https://via.placeholder.com/150',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    online: true,
    bio: '', // Additional profile fields
    location: '',
    phoneNumber: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false
    }
  };

  await setDoc(userRef, userData);
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const updateData: any = { ...updates };
  
  // If displayName is being updated, also update the lowercase version
  if (updates.displayName) {
    updateData.displayNameLower = updates.displayName.toLowerCase();
  }
  
  await updateDoc(userRef, updateData);
};

export const updateUserOnlineStatus = async (userId: string, isOnline: boolean) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    online: isOnline,
    lastSeen: serverTimestamp()
  });
};

// Chat room operations
interface ChatRoomData {
  type: 'private' | 'group';
  participants: string[];
  createdAt: any; // FirebaseFirestore.FieldValue
  lastMessage?: {
    text: string;
    timestamp: any; // FirebaseFirestore.FieldValue
  };
  unreadCount: number;
  groupInfo?: {
    id: string;
    name: string;
    photoURL: string;
    description: string;
  };
}

export const createChatRoom = async (data: Omit<ChatRoomData, 'createdAt'>) => {
  const chatRoomRef = doc(collection(db, COLLECTIONS.CHAT_ROOMS));
  const chatRoomData: ChatRoomData = {
    ...data,
    createdAt: serverTimestamp(),
    unreadCount: 0
  };

  await setDoc(chatRoomRef, chatRoomData);
  return chatRoomRef.id;
};

// Message operations
interface MessageData {
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
}

export const createMessage = async (roomId: string, messageData: MessageData) => {
  const messageRef = doc(collection(db, `${COLLECTIONS.CHAT_ROOMS}/${roomId}/messages`));
  const message = {
    ...messageData,
    timestamp: serverTimestamp()
  };

  await setDoc(messageRef, message);

  // Update the chat room's last message
  const chatRoomRef = doc(db, COLLECTIONS.CHAT_ROOMS, roomId);
  await updateDoc(chatRoomRef, {
    lastMessage: {
      text: messageData.text,
      timestamp: serverTimestamp()
    },
    unreadCount: messageData.senderId ? 1 : 0
  });

  return messageRef.id;
};

// Initialize collections with proper structure
export const createInitialCollections = async () => {
  const collections = [
    {
      name: COLLECTIONS.USERS,
      dummyData: {
        uid: '_dummy',
        email: 'dummy@example.com',
        displayName: 'Dummy User',
        displayNameLower: 'dummy user',
        photoURL: 'https://via.placeholder.com/150',
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        online: false
      }
    },
    {
      name: COLLECTIONS.CHAT_ROOMS,
      dummyData: {
        type: 'private',
        participants: ['_dummy1', '_dummy2'],
        createdAt: serverTimestamp(),
        unreadCount: 0
      }
    },
    {
      name: COLLECTIONS.GROUPS,
      dummyData: {
        name: '_dummy_group',
        description: 'Dummy group for initialization',
        createdAt: serverTimestamp()
      }
    }
  ];

  for (const { name, dummyData } of collections) {
    const dummyRef = doc(collection(db, name), '_dummy');
    try {
      await setDoc(dummyRef, {
        ...dummyData,
        _isDummy: true,
        _created: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error creating collection ${name}:`, error);
    }
  }
};

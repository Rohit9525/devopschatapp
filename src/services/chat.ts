import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  arrayRemove,
  arrayUnion,
  writeBatch,
  onSnapshot,
  Timestamp // Ensure Timestamp is imported
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ChatRoom, Message } from '../types';

// Transform Firestore timestamp to Date
const transformTimestamp = (data: any) => ({
  ...data,
  createdAt: data.createdAt?.toDate(),
  lastMessage: data.lastMessage ? {
    ...data.lastMessage,
    timestamp: data.lastMessage.timestamp?.toDate()
  } : null
});
export const createPrivateChat = async (userId1: string, userId2: string) => {
  if (!userId1 || !userId2 || userId1 === userId2) {
    throw new Error('Invalid user IDs for private chat');
  }

  try {
    const chatRoomsRef = collection(db, 'chatRooms');
    
    // Check if chat already exists
    const q = query(
      chatRoomsRef, 
      where('type', '==', 'private'),
      where('participants', 'array-contains', userId1)
    );
    
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(userId2) && !data.removed;
    });
    
    if (existingChat) {
      return existingChat.id;
    }
    
    // Create new chat room
    const chatRoom = await addDoc(chatRoomsRef, {
      type: 'private',
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: 0,
      removed: false
    });
    
    return chatRoom.id;
  } catch (error) {
    console.error('Error creating private chat:', error);
    throw error;
  }
};

export const getChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(
      chatRoomsRef,
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...transformTimestamp(doc.data())
      } as ChatRoom))
      .filter(room => !room.removed);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
};
export const createGroupChat = async (groupData: {
  name: string;
  description?: string;
  photoURL?: string;
  members: string[];
  admins: string[];
}) => {
  // Check if group name and at least 2 members are provided
  if (!groupData.name || groupData.members.length < 2) {
    throw new Error('Group name is required and at least 2 members are needed');
  }

  try {
    // Reference to the chatRooms collection
    const chatRoomsRef = collection(db, 'chatRooms');
    
    // Create the group chat document in Firestore
    const groupChat = await addDoc(chatRoomsRef, {
      type: 'group',
      name: groupData.name,
      description: groupData.description || null,  // Use `null` if no description is provided
      photoURL: groupData.photoURL || 'https://via.placeholder.com/100',  // Default photo if none is provided
      participants: groupData.members,
      admins: groupData.admins,
      createdAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: 0,
      removed: false  // Initially the chat is not removed
    });
    
    // Return the newly created group's ID
    return groupChat.id;
  } catch (error) {
    console.error('Error creating group chat:', error);
    throw error;
  }
};


export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error('Chat room not found');
    }
    
    return {
      id: roomSnap.id,
      ...transformTimestamp(roomSnap.data())
    } as ChatRoom;
  } catch (error) {
    console.error('Error fetching chat room:', error);
    throw error;
  }
};

export const getChatMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  if (!roomId) {
    throw new Error('Room ID is required');
  }

  try {
    const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp)?.toDate()
      })) as Message[];
      
      callback(messages.reverse());
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (message: Omit<Message, 'id'>) => {
  if (!message.roomId || !message.senderId || !message.text) {
    throw new Error('Room ID, sender ID, and message text are required');
  }

  const batch = writeBatch(db);
  
  try {
    // Add message
    const messagesRef = collection(db, `chatRooms/${message.roomId}/messages`);
    const messageDoc = doc(messagesRef);
    batch.set(messageDoc, {
      ...message,
      timestamp: serverTimestamp()
    });
    
    // Update chat room
    const roomRef = doc(db, 'chatRooms', message.roomId);
    batch.update(roomRef, {
      lastMessage: {
        text: message.text,
        timestamp: serverTimestamp()
      },
      unreadCount: message.senderId ? 1 : 0
    });
    
    await batch.commit();
    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const leaveGroupChat = async (groupId: string, userId: string) => {
  if (!groupId || !userId) {
    throw new Error('Group ID and User ID are required');
  }

  const batch = writeBatch(db);
  
  try {
    const groupRef = doc(db, 'chatRooms', groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }
    
    const groupData = groupSnap.data();
    if (groupData.type !== 'group') {
      throw new Error('Not a group chat');
    }
    
    // Remove user from participants and admins
    batch.update(groupRef, {
      participants: arrayRemove(userId),
      admins: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    // Check if group is empty after leaving
    const updatedGroupSnap = await getDoc(groupRef);
    const remainingParticipants = updatedGroupSnap.data()?.participants || [];
    
    if (remainingParticipants.length === 0) {
      await deleteDoc(groupRef);
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const removeContact = async (currentUserId: string, contactId: string) => {
  if (!currentUserId || !contactId) {
    throw new Error('Current user ID and contact ID are required');
  }

  const batch = writeBatch(db);
  
  try {
    // Find private chat room between users
    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(
      chatRoomsRef,
      where('type', '==', 'private'),
      where('participants', 'array-contains', currentUserId)
    );
    
    const querySnapshot = await getDocs(q);
    const chatRoom = querySnapshot.docs.find(doc => 
      doc.data().participants.includes(contactId)
    );
    
    if (chatRoom) {
      // Mark chat room as removed
      const roomRef = doc(db, 'chatRooms', chatRoom.id);
      batch.update(roomRef, {
        removed: true,
        removedAt: serverTimestamp(),
        removedBy: currentUserId,
        participants: arrayRemove(currentUserId)
      });
    }
    
    // Update both users' contacts
    const currentUserRef = doc(db, 'users', currentUserId);
    const contactUserRef = doc(db, 'users', contactId);
    
    batch.update(currentUserRef, {
      contacts: arrayRemove(contactId)
    });
    
    batch.update(contactUserRef, {
      contacts: arrayRemove(currentUserId)
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error removing contact:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string, roomId: string) => {
  if (!messageId || !roomId) {
    throw new Error('Message ID and Room ID are required');
  }

  try {
    const messageRef = doc(db, `chatRooms/${roomId}/messages`, messageId);
    await updateDoc(messageRef, { 
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const searchUsers = async (searchQuery: string) => {
  if (!searchQuery || searchQuery.length < 2) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    
    // Create case-insensitive search queries
    const searchTerms = [
      query(
        usersRef, 
        where('displayName', '>=', searchQuery.toLowerCase()),
        where('displayName', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      ),
      query(
        usersRef, 
        where('email', '>=', searchQuery.toLowerCase()),
        where('email', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      )
    ];

    // Collect and deduplicate results
    const users = (await Promise.all(
      searchTerms.map(async (q) => {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      })
    )).flat();

    return Array.from(new Map(users.map(user => [user.id, user])).values());
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const updateGroupName = async (roomId: string, newGroupName: string) => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      'groupInfo.name': newGroupName,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating group name:', error);
    throw error;
  }
};

export const updateGroupPhoto = async (roomId: string, newPhotoURL: string) => {
  try {
    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      'groupInfo.photoURL': newPhotoURL,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating group photo:', error);
    throw error;
  }
};

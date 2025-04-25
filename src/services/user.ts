import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../lib/firebase';
import { User } from '../types';
import { removeChat } from './chat';

export const searchUsers = async (searchQuery: string): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('displayNameLower', '>=', searchQuery.toLowerCase()),
    where('displayNameLower', '<=', searchQuery.toLowerCase() + '\uf8ff'),
    orderBy('displayNameLower'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as User));
};

export const updateUserProfile = async (
  displayName: string,
  photoFile?: File | string
) => {
  if (!auth.currentUser) throw new Error('No authenticated user');

  let photoURL = typeof photoFile === 'string' ? photoFile : undefined;

  if (photoFile instanceof File) {
    const photoRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
    const snapshot = await uploadBytes(photoRef, photoFile);
    photoURL = await getDownloadURL(snapshot.ref);
  }

  await updateProfile(auth.currentUser, {
    displayName,
    ...(photoURL && { photoURL })
  });

  const userRef = doc(db, 'users', auth.currentUser.uid);
  await updateDoc(userRef, {
    displayName,
    displayNameLower: displayName.toLowerCase(),
    ...(photoURL && { photoURL }),
    updatedAt: serverTimestamp()
  });

  return photoURL;
};

export const updateUserStatus = async (status: 'online' | 'offline') => {
  if (!auth.currentUser) return;

  const userRef = doc(db, 'users', auth.currentUser.uid);
  await updateDoc(userRef, {
    online: status === 'online',
    lastSeen: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    uid: userSnap.id,
    ...data,
    lastSeen: data.lastSeen?.toDate(),
    createdAt: data.createdAt?.toDate()
  } as User;
};

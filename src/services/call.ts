import Peer from 'simple-peer';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

interface CallData {
  callerId: string;
  receiverId: string;
  offer?: string;
  answer?: string;
  iceCandidates?: string[];
}

const callDoc = (callId: string) => doc(db, 'calls', callId);
const callOfferDoc = (callId: string) => doc(callDoc(callId), 'offerCandidates', 'offer');
const callAnswerDoc = (callId: string) => doc(callDoc(callId), 'answerCandidates', 'answer');

export const createCall = async (callerId: string, receiverId: string) => {
  const callId = `${callerId}-${receiverId}-${Date.now()}`; // Generate unique callId
  await setDoc(callDoc(callId), {
    callerId,
    receiverId,
    status: 'ringing', // Status of the call, e.g., ringing, connected, ended
    createdAt: new Date(),
  });
  return callId;
};

export const listenForCallOffer = (callId: string, onOffer: (offer: string) => void) => {
  return onSnapshot(callOfferDoc(callId), (doc) => {
    if (doc.exists() && doc.data().offer) {
      onOffer(doc.data().offer);
    }
  });
};

export const sendCallOffer = async (callId: string, offer: string) => {
  await setDoc(callOfferDoc(callId), { offer });
};

export const listenForCallAnswer = (callId: string, onAnswer: (answer: string) => void) => {
  return onSnapshot(callAnswerDoc(callId), (doc) => {
    if (doc.exists() && doc.data().answer) {
      onAnswer(doc.data().answer);
    }
  });
};

export const sendCallAnswer = async (callId: string, answer: string) => {
  await setDoc(callAnswerDoc(callId), { answer });
};

export const getCall = async (callId: string) => {
  const callSnap = await getDoc(callDoc(callId));
  if (callSnap.exists()) {
    return callSnap.data();
  }
  return null;
};

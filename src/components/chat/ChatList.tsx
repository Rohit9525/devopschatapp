import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTimestamp } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { getChatRooms } from '../../services/chat';
import { getUserProfile } from '../../services/user';
import type { ChatRoom, User } from '../../types';
import { Timestamp } from 'firebase/firestore';

interface ChatListProps {
  searchQuery: string;
  refresh: boolean; // Add refresh prop
}

export default function ChatList({ searchQuery, refresh }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [contactNames, setContactNames] = useState<Record<string, User>>({});
  const { currentUser } = useAuth() || {};
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadChatRooms = async () => {
      const rooms = await getChatRooms(currentUser.uid);
      setChatRooms(rooms);

      // Load contact names for private chats
      const contactIds = rooms
        .filter(room => room.type === 'private')
        .map(room => room.participants.find(id => id !== currentUser.uid))
        .filter((id): id is string => !!id);

      const uniqueContactIds = [...new Set(contactIds)];
      const contactProfiles = await Promise.all(
        uniqueContactIds.map(id => getUserProfile(id))
      );

      const contactMap: Record<string, User> = {};
      contactProfiles.forEach(profile => {
        if (profile) {
          contactMap[profile.uid] = profile;
        }
      });
      setContactNames(contactMap);
    };

    loadChatRooms();
  }, [currentUser, refresh]); // Add refresh as a dependency

  const getContactName = (room: ChatRoom): string => {
    if (room.type === 'group') {
      return room.groupInfo?.name || 'Unnamed Group';
    }
    const contactId = room.participants.find(id => id !== currentUser?.uid);
    return contactId ? contactNames[contactId]?.displayName || 'Unknown Contact' : 'Unknown Contact';
  };

  const getContactPhoto = (room: ChatRoom): string => {
    if (room.type === 'group') {
      return room.groupInfo?.photoURL || 'https://via.placeholder.com/40';
    }
    const contactId = room.participants.find(id => id !== currentUser?.uid);
    return contactId ? contactNames[contactId]?.photoURL || 'https://via.placeholder.com/40' : 'https://via.placeholder.com/40';
  };

  const filteredRooms = chatRooms.filter(room => {
    const name = getContactName(room);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getFormattedTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    if (timestamp instanceof Timestamp) {
      return formatTimestamp(timestamp.toDate());
    }
    
    if (timestamp instanceof Date) {
      return formatTimestamp(timestamp);
    }
    
    if (typeof timestamp === 'number') {
      return formatTimestamp(new Date(timestamp));
    }
    
    if (timestamp?.seconds) {
      return formatTimestamp(new Date(timestamp.seconds * 1000));
    }
    
    return '';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredRooms.map((room) => (
        <button
          key={room.id}
          onClick={() => navigate(`/chat/${room.id}`)}
          className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            roomId === room.id ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <img
            src={getContactPhoto(room)}
            alt={getContactName(room)}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate dark:text-white">
                {getContactName(room)}
              </h3>
              {room.lastMessage && (
                <span className="text-xs text-gray-500">
                  {getFormattedTimestamp(room.lastMessage.timestamp)}
                </span>
              )}
            </div>
            {room.lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {room.lastMessage.text}
              </p>
            )}
            {room.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                {room.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

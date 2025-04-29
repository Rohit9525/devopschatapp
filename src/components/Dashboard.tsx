import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './shared/Sidebar';
import ChatWindow from './chat/ChatWindow';

export default function Dashboard() {
  const { roomId } = useParams();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      {roomId ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
}

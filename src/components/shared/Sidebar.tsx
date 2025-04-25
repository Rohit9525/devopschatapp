import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../settings/ThemeToggle';
import ChatList from '../chat/ChatList';
import NewChatDialog from '../chat/NewChatDialog';
import ProfileDialog from '../settings/ProfileDialog';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { currentUser, logout } = useAuth() || {};
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshChatList, setRefreshChatList] = useState(false); // State to trigger refresh
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout?.();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  // Callback function to trigger chat list refresh
  const handleChatCreated = useCallback(() => {
    setRefreshChatList(prev => !prev); // Toggle state to trigger useEffect in ChatList
  }, []);

  return (
    <div className="w-80 h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
        >
          <img
            src={currentUser?.photoURL || 'https://via.placeholder.com/40'}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold dark:text-white">{currentUser?.displayName}</span>
        </button>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <button
        onClick={() => setIsNewChatOpen(true)}
        className="mx-4 mb-4 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>New Chat</span>
      </button>

      <ChatList searchQuery={searchQuery} refresh={refreshChatList} />

      <NewChatDialog
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onChatCreated={handleChatCreated} // Pass the callback function
      />

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Search, Users, Image as ImageIcon, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { searchUsers, createPrivateChat, createGroupChat } from '../../services/chat';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated?: () => void; // Add this line
}

export default function NewChatDialog({ isOpen, onClose, onChatCreated }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPhoto, setGroupPhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results.filter(user => user.id !== currentUser?.uid));
        } catch (error) {
          console.error('Error searching users:', error);
          toast.error('Failed to search users');
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, currentUser]);

  const handleUserSelect = (user: any) => {
    if (isGroupChat) {
      setSelectedUsers(prev => 
        prev.some(u => u.id === user.id)
          ? prev.filter(u => u.id !== user.id)
          : [...prev, user]
      );
    } else {
      setSelectedUser(prev => prev?.id === user.id ? null : user);
    }
  };

  const handleCreateChat = async () => {
    setIsLoading(true);
    try {
      if (isGroupChat) {
        if (!groupName.trim()) {
          toast.error('Please enter a group name');
          return;
        }
        if (selectedUsers.length < 2) {
          toast.error('Please select at least 2 members');
          return;
        }

        const groupId = await createGroupChat({
          name: groupName,
          description: groupDescription,
          photoURL: groupPhoto || 'https://via.placeholder.com/100',
          members: [...selectedUsers.map(u => u.id), currentUser?.uid || ''],
          admins: [currentUser?.uid || ''],
          createdAt: new Date()
        });
        navigate(`/chat/${groupId}`);
        toast.success('Group created successfully');
      } else {
        if (!selectedUser) {
          toast.error('Please select a user to chat with');
          return;
        }
        const chatId = await createPrivateChat(currentUser?.uid || '', selectedUser.id);
        navigate(`/chat/${chatId}`);
        toast.success('Chat started successfully');
      }
      onClose();
      resetForm();
      onChatCreated?.(); // Call the callback function
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setSelectedUser(null);
    setGroupName('');
    setGroupDescription('');
    setGroupPhoto('');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
          >
            {isGroupChat ? 'Create Group Chat' : 'Start New Chat'}
          </Dialog.Title>

          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => {
                  setIsGroupChat(false);
                  setSelectedUsers([]);
                  setSelectedUser(null);
                }}
                className={`flex-1 py-2 rounded-lg ${
                  !isGroupChat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Private Chat
              </button>
              <button
                onClick={() => {
                  setIsGroupChat(true);
                  setSelectedUser(null);
                }}
                className={`flex-1 py-2 rounded-lg ${
                  isGroupChat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Group Chat
              </button>
            </div>

            {isGroupChat && (
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Group Description (optional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={groupPhoto}
                    onChange={(e) => setGroupPhoto(e.target.value)}
                    placeholder="Group Photo URL (optional)"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isGroupChat ? 'Search people to add' : 'Search contacts'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {selectedUsers.length > 0 && isGroupChat && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {user.displayName}
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer relative ${
                    (isGroupChat ? selectedUsers : [selectedUser]).some(u => u?.id === user.id)
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                >
                  <img
                    src={user.photoURL || 'https://via.placeholder.com/40'}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium dark:text-white">{user.displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  {(isGroupChat ? selectedUsers : [selectedUser]).some(u => u?.id === user.id) ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No users found
                </p>
              )}
              {searchQuery.length < 2 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChat}
              disabled={isLoading || (!isGroupChat && !selectedUser) || (isGroupChat && (!groupName || selectedUsers.length < 2))}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : isGroupChat ? 'Create Group' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

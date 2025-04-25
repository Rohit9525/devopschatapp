import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Camera, X, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/user';
import toast from 'react-hot-toast';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  const { currentUser } = useAuth() || {};
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [photoSource, setPhotoSource] = useState<'upload' | 'url'>('upload');

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(displayName, newPhotoURL || photoURL || '');
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await updateUserProfile(displayName, '');
      setPhotoURL('');
      setNewPhotoURL('');
      toast.success('Profile photo removed successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to remove profile photo');
    }
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
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold dark:text-white">
              Profile Settings
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={newPhotoURL || photoURL || 'https://via.placeholder.com/128'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              {isEditing && (
                <>
                  <label className="absolute bottom-0 left-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="dark:text-white">{displayName}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md dark:text-white">
                  {currentUser?.email}
                </div>
              </div>
            </div>

            {isEditing && (
              <>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="upload"
                      checked={photoSource === 'upload'}
                      onChange={() => setPhotoSource('upload')}
                      className="mr-2"
                    />
                    Upload
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="url"
                      checked={photoSource === 'url'}
                      onChange={() => setPhotoSource('url')}
                      className="mr-2"
                    />
                    Use URL
                  </label>
                </div>

                {photoSource === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={newPhotoURL}
                      onChange={(e) => setNewPhotoURL(e.target.value)}
                      placeholder="Enter image URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex justify-between space-x-2">
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-700 dark:text-red-300 dark:hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline-block" />
                    Remove Photo
                  </button>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

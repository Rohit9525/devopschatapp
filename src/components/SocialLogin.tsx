import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SocialLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState({
    google: false,
    facebook: false
  });

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    try {
      if (provider === 'google') {
        await auth?.loginWithGoogle();
      } else {
        await auth?.loginWithFacebook();
      }
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading.google}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            className="h-5 w-5 mr-2"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          {isLoading.google ? 'Loading...' : 'Google'}
        </button>

        <button
          onClick={() => handleSocialLogin('facebook')}
          disabled={isLoading.facebook}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            className="h-5 w-5 mr-2"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
            alt="Facebook logo"
          />
          {isLoading.facebook ? 'Loading...' : 'Facebook'}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-8 transition-colors duration-300">
        <Logo />
        {children}
      </div>
    </div>
  );
}

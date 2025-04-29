import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-sm font-medium text-zinc-700 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition-all duration-300 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

import React from 'react';
// FIX: Import User type from the local types.ts file
import type { Theme, User } from '../types';

interface HeaderProps {
    currentUser: User | null;
    onSignOut: () => void;
    theme: Theme;
    onThemeToggle: () => void;
}

const ThemeToggleButton: React.FC<{ theme: Theme; onToggle: () => void }> = ({ theme, onToggle }) => (
    <button
        onClick={onToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="p-2 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
        {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ currentUser, onSignOut, theme, onThemeToggle }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-none dark:border-b dark:border-slate-700 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            Musika
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
            Daily prices and market data from Mbare Musika.
            </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser && (
                <>
                    <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block truncate max-w-[200px]" title={currentUser.email}>
                        Welcome, <span className="font-semibold">{currentUser.email}</span>
                    </span>
                    <button
                        onClick={onSignOut}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800 transition-colors"
                    >
                        Sign Out
                    </button>
                </>
            )}
             <ThemeToggleButton theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  );
};

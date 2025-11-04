import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AuthModalProps {
  onSignIn: (email: string) => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
        await onSignIn(email.trim());
        setIsSubmitted(true);
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isSubmitted) {
      return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-sm m-4 text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">
                    Check your email
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    A sign-in link has been sent to <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>.
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-sm m-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">
          Welcome to the Market
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mt-2 mb-6">
          Sign in with a magic link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., you@example.com"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              autoFocus
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Send Magic Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
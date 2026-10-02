'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Console Runtime Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-900/60 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Administrator Console Recovery</h2>
          <p className="text-xs text-gray-400 mt-1">
            A temporary client rendering error occurred. The recovery boundary has caught it.
          </p>
        </div>

        {error?.message && (
          <div className="bg-black/50 border border-gray-800 rounded-lg p-3 text-left font-mono text-[11px] text-red-300 max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              // Clear cached notes or corrupted local state if needed
              reset();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
          >
            Reload Admin Console
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-all text-center"
          >
            Return to User Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

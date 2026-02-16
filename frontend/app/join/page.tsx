'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinQuizForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quizId, setQuizId] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Read from searchParams only after component mounts (client-side only)
    const id = searchParams?.get('id') || '';
    if (id) {
      setQuizId(id);
    }
  }, [searchParams]);

  const handleJoin = () => {
    if (!quizId.trim()) {
      setError('Please enter a Quiz ID');
      return;
    }
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    router.push(`/join/${quizId}?nickname=${encodeURIComponent(nickname)}`);
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz ID
            </label>
            <input
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              placeholder="Enter Quiz ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Join Quiz
          </button>
        </div>
      </div>
    </>
  );
}

export default function JoinQuizPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Join Quiz</h1>
        <Suspense fallback={
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <JoinQuizForm />
        </Suspense>
      </div>
    </div>
  );
}

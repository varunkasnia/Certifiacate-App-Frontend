'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, quizAPI } from '@/lib/api';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    authAPI.me()
      .then((res) => setUser(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));

    loadQuizzes();
  }, [router]);

  const loadQuizzes = async () => {
    try {
      const response = await quizAPI.list();
      // Handle paginated response or direct array
      const quizzesData = response.data?.results || response.data || [];
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setQuizzes([]); // Ensure it's always an array
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      ready: 'bg-blue-100 text-blue-800',
      live: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getQuizRoute = (quiz: any) => {
    if (quiz.status === 'draft') {
      return `/host/${quiz.id}/upload`;
    } else if (quiz.status === 'ready') {
      return `/host/${quiz.id}/lobby`;
    } else if (quiz.status === 'live') {
      return `/host/${quiz.id}/live`;
    } else {
      return `/host/${quiz.id}/review`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-primary-700">LIVEQUIZ AI</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h2>
          <p className="text-xl text-gray-600">
            Host a quiz or join an existing one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Link
            href="/host/create"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Host Quiz</h3>
              <p className="text-gray-600">
                Create and manage your own quiz. Upload materials, generate questions, and host live sessions.
              </p>
            </div>
          </Link>

          <Link
            href="/join"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Quiz</h3>
              <p className="text-gray-600">
                Enter a quiz ID or scan a QR code to join an active quiz session.
              </p>
            </div>
          </Link>
        </div>

        {/* Previous Quizzes Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
            <button
              onClick={loadQuizzes}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {quizzesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : !Array.isArray(quizzes) || quizzes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes yet</h3>
              <p className="text-gray-500 mb-6">Create your first quiz to get started!</p>
              <Link
                href="/host/create"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Create Quiz
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(quizzes) && quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={getQuizRoute(quiz)}
                  className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-primary-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{quiz.title}</h3>
                    {getStatusBadge(quiz.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <span className="font-semibold">{quiz.questions?.length || 0}</span> questions
                    </div>
                    <div>
                      {quiz.participant_count || 0} participants
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      <span className="capitalize">{quiz.difficulty}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

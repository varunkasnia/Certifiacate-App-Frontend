'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { quizAPI } from '@/lib/api';
import { QuizWebSocketClient } from '@/lib/websocket';

// Import QR code dynamically to avoid SSR issues
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
});

export default function HostLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [ws, setWs] = useState<QuizWebSocketClient | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ?
      document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] : null;

    if (!token) {
      router.push('/login');
      return;
    }

    loadQuiz();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [quizId, router]);

  const loadQuiz = async () => {
    try {
      const response = await quizAPI.get(quizId);
      setQuiz(response.data);
      setParticipantCount(response.data.participant_count || 0);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  const connectWebSocket = () => {
    const websocket = new QuizWebSocketClient(quizId);
    websocket.connect().then(() => {
      setWs(websocket);

      websocket.on('participant_update', (data: any) => {
        setParticipantCount(data.participant_count);
      });

      websocket.on('quiz_state', (data: any) => {
        if (data.data?.participant_count !== undefined) {
          setParticipantCount(data.data.participant_count);
        }
        if (data.data?.status === 'live') {
          router.push(`/host/${quizId}/live`);
        }
      });

      websocket.on('error', (data: any) => {
        setError(data.message || 'An error occurred');
        console.error('WebSocket error:', data.message);
      });
    });
  };

  const handleStartQuiz = () => {
    console.log('Attempting to start quiz...');
    console.log('WebSocket connected:', !!ws);
    if (ws) {
      ws.send('start_quiz');
      console.log('Sent start_quiz message');
    } else {
      console.error('WebSocket not connected');
    }
  };

  const quizUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${quizId}` : '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Quiz Lobby</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">{quiz?.title}</h2>
          <p className="text-gray-600 mb-4">{quiz?.description}</p>
          <div className="text-lg">
            <span className="font-semibold">Quiz ID:</span> {quizId}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">QR Code</h3>
            <div className="flex justify-center">
              {quizUrl && <QRCodeSVG value={quizUrl} size={200} />}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Participants</h3>
            <div className="text-4xl font-bold text-primary-600 text-center">
              {participantCount}
            </div>
            <p className="text-center text-gray-600 mt-2">Waiting to join</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Share Quiz Link</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={quizUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(quizUrl);
                alert('Link copied!');
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            disabled={participantCount === 0}
            className="bg-green-600 text-white px-8 py-4 rounded-md hover:bg-green-700 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

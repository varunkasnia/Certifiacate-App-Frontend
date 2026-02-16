'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import { QuizWebSocketClient } from '@/lib/websocket';
import { Question, LeaderboardEntry } from '@/types/quiz';

function ParticipantQuizContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const [nickname, setNickname] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizStatus, setQuizStatus] = useState<'waiting' | 'live' | 'completed'>('waiting');
  const [ws, setWs] = useState<QuizWebSocketClient | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  useEffect(() => {
    const nick = searchParams?.get('nickname') || '';
    if (nick) {
      setNickname(nick);
      setShowNicknameForm(false);
    } else {
      setShowNicknameForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!nickname || !quizId) return;

    joinQuiz();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [quizId, nickname]);

  // Synchronized timer - continues counting down even after answering
  useEffect(() => {
    if (timeLeft > 0 && quizStatus === 'live' && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Note: In synchronized mode, timer expiring doesn't auto-advance
    // Host controls when to move to next question
  }, [timeLeft, quizStatus, currentQuestion]);

  const joinQuiz = async () => {
    try {
      await quizAPI.join(quizId, nickname);
    } catch (err) {
      console.error('Failed to join quiz:', err);
    }
  };

  const connectWebSocket = () => {
    if (!nickname) return;
    
    const websocket = new QuizWebSocketClient(quizId);
    websocket.connect().then(() => {
      setWs(websocket);

      // Send join message after connection is established
      setTimeout(() => {
        if (nickname) {
          websocket.send('join', { nickname });
        }
      }, 100);

      websocket.on('quiz_state', (data: any) => {
        if (data.data.status === 'live') {
          setQuizStatus('live');
          // If joining a live quiz, the question will be sent individually
        } else if (data.data.status === 'ready') {
          setQuizStatus('waiting');
        }
      });

      websocket.on('question', (data: any) => {
        setCurrentQuestion(data.question);
        setTimeLeft(data.time_limit);
        setSelectedOption('');
        setAnswered(false);
        setStartTime(Date.now());
        setQuizStatus('live'); // Ensure status is live when question arrives
        // Reset error state when new question arrives
      });

      websocket.on('leaderboard', (data: any) => {
        setLeaderboard(data.data);
      });

      websocket.on('quiz_completed', (data: any) => {
        setQuizStatus('completed');
        setLeaderboard(data.leaderboard);
      });
    }).catch((err) => {
      console.error('WebSocket connection failed:', err);
    });
  };

  const handleAnswer = (option: string) => {
    if (answered || !currentQuestion) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!currentQuestion || answered || !selectedOption) return;
    
    const responseTime = (Date.now() - startTime) / 1000;
    
    if (ws) {
      ws.send('submit_answer', {
        nickname,
        question_id: currentQuestion.id,
        selected_option: selectedOption,
        response_time: responseTime,
      });
    }

    setAnswered(true);
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nicknameInput.trim()) {
      router.push(`/join/${quizId}?nickname=${encodeURIComponent(nicknameInput.trim())}`);
    }
  };

  if (showNicknameForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-primary-700">Join Quiz</h1>
          <p className="text-center text-gray-600 mb-6">Quiz ID: <span className="font-mono text-sm">{quizId}</span></p>
          
          <form onSubmit={handleNicknameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Enter your nickname"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Join Quiz
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (quizStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Waiting for quiz to start...</h2>
          <p className="text-gray-600">Please wait while the host starts the quiz</p>
        </div>
      </div>
    );
  }

  if (quizStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Quiz Completed!</h1>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">Final Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.nickname}
                  className={`flex justify-between items-center p-4 rounded ${
                    entry.nickname === nickname ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-lg">#{entry.rank}</span>{' '}
                    <span className={entry.nickname === nickname ? 'font-semibold' : ''}>
                      {entry.nickname}
                    </span>
                  </div>
                  <div className="text-primary-600 font-bold text-lg">{entry.total_score} pts</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => router.push('/join')}
              className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 font-semibold text-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {currentQuestion ? `Question ${currentQuestion.order + 1}` : 'Waiting...'}
                </h2>
                {currentQuestion && (
                  <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-primary-600'}`}>
                    {timeLeft}s
                  </div>
                )}
              </div>

              {currentQuestion && (
                <>
                  <p className="text-lg mb-4">{currentQuestion.question_text}</p>
                  <div className="mb-4 text-sm text-gray-600">
                    {answered ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Answer submitted! Waiting for host to advance...
                      </span>
                    ) : (
                      <span className={timeLeft < 10 ? 'text-red-600 font-semibold' : ''}>
                        Time remaining: {timeLeft}s • Waiting for host to advance to next question
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
                      const isSelected = selectedOption === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          disabled={answered}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          } ${answered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="font-semibold">{option}.</span> {optionText}
                        </button>
                      );
                    })}
                  </div>

                  {!answered && (
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Host will advance to the next question when timer runs out or manually
                      </p>
                    </div>
                  )}

                  {answered && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-800 font-semibold">
                        Answer submitted! Waiting for next question...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div
                    key={entry.nickname}
                    className={`flex justify-between items-center p-2 rounded ${
                      entry.nickname === nickname ? 'bg-primary-50' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">#{entry.rank}</span> {entry.nickname}
                    </div>
                    <div className="text-primary-600 font-semibold">{entry.total_score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ParticipantQuizContent />
    </Suspense>
  );
}

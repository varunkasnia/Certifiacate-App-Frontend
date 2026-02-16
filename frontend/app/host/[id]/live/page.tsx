'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import { QuizWebSocketClient } from '@/lib/websocket';
import { Question, LeaderboardEntry } from '@/types/quiz';

export default function HostLiveQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [ws, setWs] = useState<QuizWebSocketClient | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadQuizInfo();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [quizId]);

  // Synchronized timer - counts down and can be controlled by host
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0 && currentQuestion) {
      // Timer expired - auto-advance to next question
      handleNextQuestion();
    }
  }, [timeLeft, timerActive, quizCompleted, currentQuestion]);

  const loadQuizInfo = async () => {
    try {
      const response = await quizAPI.get(quizId);
      const questions = response.data.questions || [];
      setTotalQuestions(questions.length);
    } catch (err) {
      console.error('Failed to load quiz info:', err);
    }
  };

  const connectWebSocket = () => {
    const websocket = new QuizWebSocketClient(quizId);
    websocket.connect().then(() => {
      setWs(websocket);

      websocket.on('question', (data: any) => {
        setCurrentQuestion(data.question);
        setCurrentIndex(data.question.index);
        setTimeLeft(data.time_limit);
        setTimerActive(true); // Start timer when question is received
      });

      websocket.on('leaderboard', (data: any) => {
        setLeaderboard(data.data);
      });

      websocket.on('quiz_completed', (data: any) => {
        setQuizCompleted(true);
        setTimerActive(false);
        setLeaderboard(data.leaderboard);
      });
    });
  };

  const handleDownloadResults = async () => {
    try {
      const response = await quizAPI.downloadResults(quizId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${quizId}_results.xlsx`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download quiz results:', error);
      alert('Failed to download quiz results. Please try again.');
    }
  };

  const handleNextQuestion = () => {
    if (ws && !quizCompleted) {
      setTimerActive(false);
      ws.send('next_question');
    }
  };

  const handleGetLeaderboard = () => {
    if (ws) {
      ws.send('get_leaderboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              {currentQuestion ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      Question {currentIndex + 1}
                    </h2>
                    <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-primary-600'}`}>
                      {timeLeft}s
                    </div>
                  </div>
                  <p className="text-lg mb-4">{currentQuestion.question_text}</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded">A. {currentQuestion.option_a}</div>
                    <div className="p-3 bg-gray-50 rounded">B. {currentQuestion.option_b}</div>
                    <div className="p-3 bg-gray-50 rounded">C. {currentQuestion.option_c}</div>
                    <div className="p-3 bg-gray-50 rounded">D. {currentQuestion.option_d}</div>
                  </div>
                  {!quizCompleted && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Question {currentIndex + 1} of {totalQuestions}</span>
                        <span className={timeLeft < 10 ? 'text-red-600 font-semibold' : ''}>
                          {timeLeft}s remaining
                        </span>
                      </div>
                      <button
                        onClick={handleNextQuestion}
                        disabled={quizCompleted}
                        className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        {currentIndex + 1 >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        All participants will see the next question when you click "Next Question" or when the timer runs out
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p>Waiting for quiz to start...</p>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
              <button
                onClick={handleGetLeaderboard}
                className="mb-4 text-sm text-primary-600 hover:underline"
              >
                Refresh
              </button>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div key={entry.nickname} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-semibold">#{entry.rank}</span> {entry.nickname}
                    </div>
                    <div className="text-primary-600 font-semibold">{entry.total_score}</div>
                  </div>
                ))}
              </div>
              {quizCompleted && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-50 rounded">
                    <p className="font-semibold text-green-800">Quiz Completed!</p>
                  </div>
                  <button
                    onClick={handleDownloadResults}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                  >
                    Download Results
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

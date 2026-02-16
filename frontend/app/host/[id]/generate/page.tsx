'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';

export default function GenerateQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [numQuestions, setNumQuestions] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      await quizAPI.generateQuestions(quizId, { num_questions: numQuestions });
      router.push(`/host/${quizId}/review`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSkip = () => {
    router.push(`/host/${quizId}/review`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Generate Questions</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              min={1}
              max={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              AI will generate questions based on your uploaded materials or quiz description.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {generating ? 'Generating Questions...' : 'Generate Questions'}
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Skip (Add Manually)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

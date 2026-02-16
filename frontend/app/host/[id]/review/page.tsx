'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import { Question } from '@/types/quiz';

export default function ReviewQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await quizAPI.getQuestions(quizId);
      setQuestions(response.data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditForm(question);
  };

  const handleSave = async (questionId: string) => {
    try {
      await quizAPI.updateQuestion(quizId, { question_id: questionId, ...editForm });
      setEditingId(null);
      loadQuestions();
    } catch (err) {
      console.error('Failed to update question:', err);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await quizAPI.deleteQuestion(quizId, questionId);
      loadQuestions();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleAddQuestion = async () => {
    router.push(`/host/${quizId}/add-question`);
  };

  const handleConfirm = async () => {
    try {
      await quizAPI.confirmQuiz(quizId);
      router.push(`/host/${quizId}/lobby`);
    } catch (err) {
      console.error('Failed to confirm quiz:', err);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Review Questions</h1>
          <button
            onClick={handleAddQuestion}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            + Add Question
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow">
              {editingId === q.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.question_text || ''}
                    onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Question"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editForm.option_a || ''}
                      onChange={(e) => setEditForm({ ...editForm, option_a: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                      placeholder="Option A"
                    />
                    <input
                      type="text"
                      value={editForm.option_b || ''}
                      onChange={(e) => setEditForm({ ...editForm, option_b: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                      placeholder="Option B"
                    />
                    <input
                      type="text"
                      value={editForm.option_c || ''}
                      onChange={(e) => setEditForm({ ...editForm, option_c: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                      placeholder="Option C"
                    />
                    <input
                      type="text"
                      value={editForm.option_d || ''}
                      onChange={(e) => setEditForm({ ...editForm, option_d: e.target.value })}
                      className="px-3 py-2 border rounded-md"
                      placeholder="Option D"
                    />
                  </div>
                  <select
                    value={editForm.correct_answer || 'A'}
                    onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value as any })}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(q.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">
                      Q{idx + 1}: {q.question_text}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="text-primary-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={q.correct_answer === 'A' ? 'font-bold text-green-600' : ''}>
                      A. {q.option_a}
                    </div>
                    <div className={q.correct_answer === 'B' ? 'font-bold text-green-600' : ''}>
                      B. {q.option_b}
                    </div>
                    <div className={q.correct_answer === 'C' ? 'font-bold text-green-600' : ''}>
                      C. {q.option_c}
                    </div>
                    <div className={q.correct_answer === 'D' ? 'font-bold text-green-600' : ''}>
                      D. {q.option_d}
                    </div>
                  </div>
                  {q.explanation && (
                    <p className="mt-2 text-sm text-gray-600">Explanation: {q.explanation}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {questions.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 text-lg"
            >
              Confirm Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

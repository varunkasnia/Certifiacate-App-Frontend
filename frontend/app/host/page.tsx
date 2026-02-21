'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, History, Sparkles, Play, Trash2, User } from 'lucide-react'
import { gameAPI, quizAPI } from '@/lib/api'

export default function HostPage() {
  const router = useRouter()
  const [hostName, setHostName] = useState('')
  const [ready, setReady] = useState(false)

  const [quizzes, setQuizzes] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])

  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  useEffect(() => {
    const storedHostName = localStorage.getItem('hostName') || ''
    setHostName(storedHostName)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    loadQuizzes(hostName)
    if (hostName.trim()) {
      loadHistory(hostName)
    } else {
      setHistory([])
    }
  }, [hostName, ready])

  const loadQuizzes = async (name: string) => {
    setLoadingQuizzes(true)
    try {
      const response = await quizAPI.list(name.trim() || undefined)
      setQuizzes(response.data)
    } catch (error) {
      console.error('Failed to load quizzes:', error)
    } finally {
      setLoadingQuizzes(false)
    }
  }

  const loadHistory = async (name: string) => {
    setLoadingHistory(true)
    try {
      const response = await gameAPI.history(name.trim())
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to load hosted history:', error)
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const persistHostName = (value: string) => {
    setHostName(value)
    localStorage.setItem('hostName', value)
  }

  const handleHostQuiz = async (quizId: number) => {
    const normalizedHost = hostName.trim()
    if (!normalizedHost) {
      alert('Enter host name first to host a quiz')
      return
    }

    setActionLoadingId(quizId)
    try {
      const response = await gameAPI.create({ quiz_id: quizId, host_name: normalizedHost })
      router.push(`/host/lobby?pin=${response.data.pin}`)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to host quiz')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm('Delete this quiz from history? This cannot be undone.')) return

    try {
      await quizAPI.deleteQuiz(quizId)
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId))
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete quiz')
    }
  }

  const handleDeleteHostedSession = async (sessionId: number) => {
    const normalizedHost = hostName.trim()
    if (!normalizedHost) {
      alert('Enter host name first')
      return
    }

    if (!window.confirm('Delete this hosted game history entry?')) return

    try {
      await gameAPI.deleteHistory(sessionId, normalizedHost)
      setHistory((prev) => prev.filter((session) => session.id !== sessionId))
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete hosted history')
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold">Host Dashboard</h1>

          <div className="w-24" />
        </div>

        <div className="card mb-8">
          <label className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Host Name
          </label>
          <input
            value={hostName}
            onChange={(e) => persistHostName(e.target.value)}
            placeholder="Enter your host name"
            className="input-field"
          />
          <p className="text-xs text-white/50 mt-2">Used to load your quiz history and hosted sessions.</p>
        </div>

        <Link href="/host/create">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card cursor-pointer group mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1">Create New Quiz</h2>
                  <p className="text-white/60">Generate with AI or upload files</p>
                </div>
              </div>
              <Plus className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
            </div>
          </motion.div>
        </Link>

        <div className="mb-4 flex items-center gap-3">
          <History className="w-6 h-6 text-white/60" />
          <h2 className="text-2xl font-display font-bold">Your Quiz History</h2>
        </div>

        {loadingQuizzes ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/60">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card text-center py-12 mb-8">
            <p className="text-white/60 text-lg">No quizzes found for this host. Create your first one.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card hover:border-red-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <h3 className="text-xl font-semibold">{quiz.title}</h3>
                  <span className="text-sm text-white/40 shrink-0">{quiz.question_count} questions</span>
                </div>
                {quiz.description && (
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-white/40 mb-4">
                  <span>By {quiz.created_by}</span>
                  <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleHostQuiz(quiz.id)}
                    disabled={actionLoadingId === quiz.id}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 disabled:opacity-70"
                  >
                    <Play className="w-4 h-4" />
                    {actionLoadingId === quiz.id ? 'Hosting...' : 'Host'}
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="btn-secondary px-3 py-2 text-red-300 hover:text-red-200"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mb-4 flex items-center gap-3">
          <History className="w-6 h-6 text-white/60" />
          <h2 className="text-2xl font-display font-bold">Hosted Game History</h2>
        </div>

        {loadingHistory ? (
          <div className="card text-center py-10">
            <p className="text-white/60">Loading hosted game history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-white/60">No hosted game sessions yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {history.map((session) => (
              <div key={session.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{session.quiz_title}</h3>
                  <span className="text-xs uppercase tracking-wide text-white/50">{session.status}</span>
                </div>
                <p className="text-sm text-white/60 mb-2">PIN: {session.pin}</p>
                <p className="text-xs text-white/50 mb-4">
                  {session.player_count} players • {new Date(session.created_at).toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleHostQuiz(session.quiz_id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2"
                  >
                    <Play className="w-4 h-4" />
                    Host Again
                  </button>
                  <button
                    onClick={() => handleDeleteHostedSession(session.id)}
                    className="btn-secondary px-3 py-2 text-red-300 hover:text-red-200"
                    title="Delete history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

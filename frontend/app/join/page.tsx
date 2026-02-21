'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogIn } from 'lucide-react'
import Link from 'next/link'
import { gameAPI } from '@/lib/api'

export default function JoinPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('pin') || ''
    setPin(value.toUpperCase())
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pin.trim() || !name.trim()) {
      alert('Please enter both PIN and name')
      return
    }

    setLoading(true)
    try {
      const normalizedPin = pin.trim().toUpperCase()
      const response = await gameAPI.join({ pin: normalizedPin, name: name.trim() })
      localStorage.setItem('playerId', response.data.id.toString())
      localStorage.setItem('playerName', name.trim())
      router.push(`/join/game?pin=${normalizedPin}`)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center gap-2 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h1 className="text-4xl font-display font-bold mb-2 text-center">Join Quiz</h1>
          <p className="text-white/60 text-center mb-8">Enter the game PIN from your host</p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Game PIN</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="123456"
                maxLength={6}
                className="input-field text-center text-3xl font-mono tracking-widest"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Join Game
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Users, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent"
          >
            QuizAI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/70 font-light"
          >
            Create. Play. Compete in real-time.
          </motion.p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/host">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="card cursor-pointer group relative overflow-hidden h-64"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-center h-24">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold mb-3">Host Quiz</h2>
                  <p className="text-white/60 text-lg">
                    Create AI-powered quizzes and host live games
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/join">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="card cursor-pointer group relative overflow-hidden h-64"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-center h-24">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold mb-3">Join Quiz</h2>
                  <p className="text-white/60 text-lg">
                    Enter a game PIN and compete with others
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-4">
            <div className="text-3xl font-bold text-red-400 mb-2">AI</div>
            <div className="text-sm text-white/60">Powered</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-orange-400 mb-2">Real-time</div>
            <div className="text-sm text-white/60">Sync</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-2">Export</div>
            <div className="text-sm text-white/60">Results</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

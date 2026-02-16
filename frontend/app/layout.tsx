import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LIVEQUIZ AI - Real-time AI Quiz Platform',
  description: 'Create and join real-time AI-generated quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-shell">
      <header className="card">
        <h1 className="page-title">Live GenAI Quiz Platform</h1>
        <p className="page-subtitle">Host real-time quizzes with AI-generated questions and synchronized gameplay.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-semibold">Start Session</h2>
          <div className="mt-6 flex gap-3">
            <Link href="/host" className="btn bg-ink text-white">Host Quiz</Link>
            <Link href="/join" className="btn bg-mint text-white">Join Game</Link>
          </div>
        </section>
        <section className="card">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Gemini-powered quiz generation (topic or file upload)</li>
            <li>Host review + edit before publishing</li>
            <li>Real-time Socket.IO lobby and gameplay sync</li>
            <li>Speed-based scoring and final leaderboard</li>
            <li>Export results as CSV/XLSX/PDF</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

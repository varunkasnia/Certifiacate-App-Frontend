"use client";

import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useGameSocket } from "@/hooks/useGameSocket";

export default function GamePage() {
  const params = useParams<{ pin: string }>();
  const search = useSearchParams();
  const pin = params.pin;
  const name = search.get("name") || "Player";

  const socket = useGameSocket({ pin, role: "player", playerName: name });
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!socket.question) {
      setRemaining(0);
      return;
    }
    setRemaining(socket.question.time_limit_seconds);
    const interval = setInterval(() => {
      setRemaining((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [socket.questionIndex, socket.question]);

  const progress = useMemo(() => {
    if (!socket.question) return 0;
    const total = socket.question.time_limit_seconds;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }, [remaining, socket.question]);

  return (
    <div className="page-shell">
      <section className="card">
        <h1 className="page-title">Game PIN {pin}</h1>
        <p className="mt-1 text-sm text-slate-600">Player: {name}</p>
        <p className="mt-1 text-xs text-slate-500">Status: {socket.status} | Room: {socket.joined ? "Joined" : "Not joined"}</p>
      </section>

      {!socket.question && socket.status !== "finished" && (
        <section className="card">
          <p className="text-lg font-semibold">Waiting for host to start...</p>
          <p className="mt-2 text-sm text-slate-600">Joined players: {socket.players.length}</p>
        </section>
      )}

      {socket.question && socket.status === "in_progress" && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question {socket.questionIndex + 1}</p>
          <h2 className="mt-2 text-xl font-semibold">{socket.question.question}</h2>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-mint transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{remaining}s remaining</p>

          <div className="mt-4 grid gap-3">
            {socket.question.options.map((opt) => (
              <button
                key={opt.id}
                className="btn w-full border bg-white text-left"
                onClick={() => socket.emit("submit_answer", { pin, question_index: socket.questionIndex, selected_option_id: opt.id })}
              >
                <span className="mr-2 font-semibold">{opt.id}.</span>
                {opt.text}
              </button>
            ))}
          </div>

          {socket.answerAck?.accepted && (
            <p className="mt-3 text-sm">
              {socket.answerAck.is_correct ? "Correct" : "Submitted"} | +{socket.answerAck.points} points | Total {socket.answerAck.total_score}
            </p>
          )}
        </motion.section>
      )}

      {socket.status === "finished" && (
        <section className="card">
          <h2 className="text-xl font-semibold">Final Leaderboard</h2>
          <ul className="mt-3 space-y-2">
            {socket.leaderboard.map((row, idx) => (
              <li key={row.player_id} className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
                #{idx + 1} {row.player_name} - {row.score} points ({row.correct_answers} correct)
              </li>
            ))}
          </ul>
        </section>
      )}

      {socket.error && <p className="text-sm text-red-600">{socket.error}</p>}
    </div>
  );
}

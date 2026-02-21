"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { exportUrl, generateQuiz, generateQuizFromFile, getSessionQr, listQuizzes, saveQuiz, startSession } from "@/lib/api";
import { useGameSocket } from "@/hooks/useGameSocket";
import { QuizQuestion, SavedQuiz } from "@/lib/types";

export default function HostPage() {
  const [hostName, setHostName] = useState("Quiz Master");
  const [topicPrompt, setTopicPrompt] = useState("World history and scientific discoveries");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
  const [sourceTextPreview, setSourceTextPreview] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState("");
  const [pin, setPin] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SavedQuiz[]>([]);
  const [selectedHistoryQuizId, setSelectedHistoryQuizId] = useState("");

  const socket = useGameSocket({ pin, role: "host" });

  const canStartSession = !!quizId && hostName.trim().length >= 2;
  const inLobby = !!pin;
  const selectedHistoryQuiz = history.find((item) => item.id === selectedHistoryQuizId);

  const loadQuizHistory = async () => {
    setHistoryLoading(true);
    try {
      const quizzes = await listQuizzes();
      setHistory(quizzes);
    } catch (e: any) {
      setError(e.message || "Could not load quiz history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadQuizHistory();
  }, []);

  const onGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const generated = await generateQuiz({ topic_prompt: topicPrompt, difficulty, question_count: questionCount });
      setQuizTitle(generated.title);
      setQuestions(generated.questions);
      setSourceTextPreview(generated.source_text_preview || "");
    } catch (e: any) {
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const onUploadAndGenerate = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("topic_prompt", topicPrompt);
      form.append("question_count", String(questionCount));
      form.append("difficulty", difficulty);
      const generated = await generateQuizFromFile(form);
      setQuizTitle(generated.title);
      setQuestions(generated.questions);
      setSourceTextPreview(generated.source_text_preview || "");
    } catch (e: any) {
      setError(e.message || "File generation failed");
    } finally {
      setLoading(false);
    }
  };

  const onSaveQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const saved = await saveQuiz({
        title: quizTitle,
        topic_prompt: topicPrompt,
        source_text: sourceTextPreview,
        questions,
      });
      setQuizId(saved.id);
      await loadQuizHistory();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const onStartSession = async () => {
    if (!canStartSession) return;
    setLoading(true);
    setError("");
    try {
      const session = await startSession({ quiz_id: quizId, host_name: hostName });
      setPin(session.pin);
      const qr = await getSessionQr(session.pin);
      setQrUrl(qr.qr_data_url);
    } catch (e: any) {
      setError(e.message || "Start session failed");
    } finally {
      setLoading(false);
    }
  };

  const started = socket.status === "in_progress";

  const sortedBoard = useMemo(() => [...socket.leaderboard].sort((a, b) => b.score - a.score), [socket.leaderboard]);

  return (
    <div className="page-shell">
      <header className="card">
        <h1 className="page-title">Host Dashboard</h1>
        <p className="page-subtitle">Generate, review, launch, and control a live quiz in real time.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">1) Generate Quiz</h2>
          <input className="input" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Host Name" />
          <textarea className="input" rows={4} value={topicPrompt} onChange={(e) => setTopicPrompt(e.target.value)} placeholder="Topic prompt" />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input type="number" min={3} max={20} className="input" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value || 5))} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onGenerate} disabled={loading} className="btn bg-ink text-white">Generate from Prompt</button>
            <label className="btn cursor-pointer bg-sunrise text-white">
              Upload File
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadAndGenerate(file);
                }}
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">2) Review & Publish</h2>
          <input className="input" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Quiz title" />
          {sourceTextPreview && (
            <details className="rounded-xl border p-3 text-xs">
              <summary className="cursor-pointer font-semibold">Parsed Source Preview</summary>
              <p className="mt-2 whitespace-pre-wrap text-slate-600">{sourceTextPreview}</p>
            </details>
          )}
          <div className="max-h-80 space-y-3 overflow-auto pr-1">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border p-3">
                <input
                  className="w-full rounded-lg border p-2"
                  value={q.question}
                  onChange={(e) => {
                    const next = [...questions];
                    next[i] = { ...next[i], question: e.target.value };
                    setQuestions(next);
                  }}
                />
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {q.options.map((opt, idx) => (
                    <input
                      key={opt.id}
                      className="rounded-lg border p-2 text-sm"
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...questions];
                        next[i].options[idx] = { ...opt, text: e.target.value };
                        setQuestions(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onSaveQuiz} disabled={loading || !questions.length} className="btn bg-mint text-white">Save Quiz</button>
            <button onClick={onStartSession} disabled={loading || !canStartSession} className="btn bg-ink text-white">Start Lobby</button>
          </div>
          {quizId && <p className="text-xs text-slate-500">Saved quiz ID: {quizId}</p>}
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">3) Re-host From History</h2>
          <button onClick={loadQuizHistory} disabled={historyLoading} className="btn border bg-white">
            {historyLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-600">No saved quizzes yet. Save a quiz first, then re-host it here.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="input"
              value={selectedHistoryQuizId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedHistoryQuizId(nextId);
                setQuizId(nextId || "");
              }}
            >
              <option value="">Select saved quiz</option>
              {history.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.question_count}Q)
                </option>
              ))}
            </select>
            <button
              onClick={onStartSession}
              disabled={loading || !selectedHistoryQuizId || hostName.trim().length < 2}
              className="btn bg-ink text-white"
            >
              Host Selected Quiz
            </button>
          </div>
        )}

        {selectedHistoryQuiz && (
          <p className="text-xs text-slate-600">
            Selected: {selectedHistoryQuiz.title} | Questions: {selectedHistoryQuiz.question_count} | Created:{" "}
            {new Date(selectedHistoryQuiz.created_at).toLocaleString()}
          </p>
        )}
      </section>

      <AnimatePresence>
        {inLobby && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card">
            <h2 className="text-lg font-semibold">4) Live Lobby</h2>
            <p className="mt-1 text-sm text-slate-600">PIN: <span className="font-mono text-xl font-bold">{pin}</span></p>
            {qrUrl && <img src={qrUrl} alt="Join QR" className="mt-3 h-36 w-36 rounded-xl border bg-white p-2" />}

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => socket.emit("start_game", { pin })} className="btn bg-ink text-white">Start Game</button>
              <button onClick={() => socket.emit("next_question", { pin })} className="btn bg-sunrise text-white" disabled={!started}>Next Question</button>
              <button onClick={() => socket.emit("end_game", { pin })} className="btn bg-red-600 text-white">End Game</button>
              <a className="btn bg-white border" href={exportUrl(pin, "csv")}>CSV</a>
              <a className="btn bg-white border" href={exportUrl(pin, "xlsx")}>XLSX</a>
              <a className="btn bg-white border" href={exportUrl(pin, "pdf")}>PDF</a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Players ({socket.players.length})</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {socket.players.map((player) => (
                    <li key={player.id} className="rounded-lg bg-slate-100 px-3 py-2">{player.name} ({player.score})</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Current Question</h3>
                <p className="mt-2 text-sm text-slate-700">{socket.question?.question || "Waiting to start..."}</p>
              </div>
            </div>

            {sortedBoard.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold">Final Leaderboard</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {sortedBoard.map((entry, idx) => (
                    <li key={entry.player_id} className="rounded-lg bg-slate-100 px-3 py-2">
                      #{idx + 1} {entry.player_name} - {entry.score} pts ({entry.correct_answers} correct)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Socket: {socket.connected ? "Connected" : "Disconnected"} | Room: {socket.joined ? "Joined" : "Not joined"} {socket.error && `| ${socket.error}`}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <Link href="/join" className="text-sm underline">Test player view</Link>
    </div>
  );
}

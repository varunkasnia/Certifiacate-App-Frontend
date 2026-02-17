"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

import { LeaderboardEntry, LobbyPlayer, QuizQuestion } from "@/lib/types";
import { createSocket } from "@/lib/socket";

type Role = "host" | "player";

export function useGameSocket({
  pin,
  role,
  playerName,
}: {
  pin: string;
  role: Role;
  playerName?: string;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [status, setStatus] = useState("lobby");
  const [questionIndex, setQuestionIndex] = useState<number>(-1);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [answerAck, setAnswerAck] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!pin) return;
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setJoined(false);
      socket.emit("join_room", { pin, player_name: playerName || "", role });
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => setError(err?.message || "Connection failed"));
    socket.on("error", (payload) => setError(payload?.detail || "Socket error"));
    socket.on("join_success", () => setJoined(true));
    socket.on("lobby_update", (payload) => {
      setStatus(payload.status);
      setPlayers(payload.players || []);
    });
    socket.on("question_started", (payload) => {
      setStatus("in_progress");
      setQuestionIndex(payload.question_index);
      setQuestion(payload.question);
      setAnswerAck(null);
    });
    socket.on("answer_ack", (payload) => setAnswerAck(payload));
    socket.on("game_ended", (payload) => {
      setStatus("finished");
      setLeaderboard(payload.leaderboard || []);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [pin, role, playerName]);

  return {
    connected,
    players,
    status,
    questionIndex,
    question,
    leaderboard,
    answerAck,
    error,
    joined,
    emit: (event: string, payload: Record<string, unknown>) => socketRef.current?.emit(event, payload),
  };
}

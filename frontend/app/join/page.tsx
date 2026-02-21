"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState(params.get("pin") || "");
  const [name, setName] = useState("");

  const onJoin = () => {
    if (pin.length !== 6 || name.trim().length < 2) return;
    router.push(`/game/${pin}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="page-shell">
      <div className="card mx-auto w-full max-w-xl">
        <h1 className="page-title">Join a Live Quiz</h1>
        <p className="page-subtitle">Enter your name and game PIN to join the lobby.</p>
        <div className="mt-5 space-y-3">
          <input
            className="input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="6-digit Game PIN"
            value={pin}
            maxLength={6}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
          <button onClick={onJoin} className="btn w-full bg-ink text-white">Enter Lobby</button>
        </div>
      </div>
    </div>
  );
}

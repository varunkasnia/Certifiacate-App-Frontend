"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Extract the form and routing logic into its own component
function JoinQuizForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState(params.get("pin") || "");
  const [name, setName] = useState("");

  const onJoin = () => {
    if (pin.length !== 6 || name.trim().length < 2) return;
    router.push(`/game/${pin}?name=${encodeURIComponent(name.trim())}`);
  };

  return (
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
        <button onClick={onJoin} className="btn w-full bg-ink text-white">
          Enter Lobby
        </button>
      </div>
    </div>
  );
}

// 2. Wrap the extracted component with Suspense in the default export
export default function JoinPage() {
  return (
    <div className="page-shell">
      {/* The fallback can be a spinner or a simple loading state */}
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <JoinQuizForm />
      </Suspense>
    </div>
  );
}

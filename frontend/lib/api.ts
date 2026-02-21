import { GeneratedQuiz, SavedQuiz, SessionInfo } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(payload.detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function generateQuiz(body: { topic_prompt: string; question_count: number; difficulty: string }) {
  const res = await fetch(`${API_URL}/api/quizzes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<GeneratedQuiz>(res);
}

export async function generateQuizFromFile(formData: FormData) {
  const res = await fetch(`${API_URL}/api/quizzes/generate-from-file`, {
    method: "POST",
    body: formData,
  });
  return parse<GeneratedQuiz>(res);
}

export async function saveQuiz(body: {
  title: string;
  topic_prompt: string;
  source_text: string;
  questions: GeneratedQuiz["questions"];
}) {
  const res = await fetch(`${API_URL}/api/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<{ id: string }>(res);
}

export async function listQuizzes() {
  const res = await fetch(`${API_URL}/api/quizzes`, { cache: "no-store" });
  return parse<SavedQuiz[]>(res);
}

export async function startSession(body: { quiz_id: string; host_name: string }) {
  const res = await fetch(`${API_URL}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<SessionInfo>(res);
}

export async function getSession(pin: string) {
  const res = await fetch(`${API_URL}/api/sessions/${pin}`, { cache: "no-store" });
  return parse<any>(res);
}

export async function getSessionQr(pin: string) {
  const res = await fetch(`${API_URL}/api/sessions/${pin}/qr`, { cache: "no-store" });
  return parse<{ pin: string; join_url: string; qr_data_url: string }>(res);
}

export function exportUrl(pin: string, fmt: "csv" | "xlsx" | "pdf") {
  return `${API_URL}/api/sessions/${pin}/export/${fmt}`;
}

export const SOCKET_URL = API_URL;

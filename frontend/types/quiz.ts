export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'ready' | 'live' | 'completed';
  time_per_question: number;
  created_at: string;
  questions?: Question[];
  participant_count?: number;
}

export interface Participant {
  id: string;
  nickname: string;
  total_score: number;
  correct_answers: number;
  total_response_time: number;
}

export interface LeaderboardEntry {
  nickname: string;
  total_score: number;
  correct_answers: number;
  total_response_time: number;
  rank: number;
}

export interface QuizWebSocket {
  connect: () => Promise<void>;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  send: (type: string, data?: any) => void;
  disconnect: () => void;
}

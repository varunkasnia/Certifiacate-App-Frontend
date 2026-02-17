export type QuestionOption = { id: string; text: string };

export type QuizQuestion = {
  question: string;
  options: QuestionOption[];
  correct_option_id: string;
  time_limit_seconds: number;
};

export type GeneratedQuiz = {
  title: string;
  questions: QuizQuestion[];
  source_text_preview?: string;
};

export type SavedQuiz = {
  id: string;
  title: string;
  topic_prompt: string;
  question_count: number;
  created_at: string;
};

export type SessionInfo = {
  id: string;
  pin: string;
  host_name: string;
  quiz_id: string;
  status: string;
  current_question_index: number;
};

export type LobbyPlayer = { id: string; name: string; score: number };
export type LeaderboardEntry = { player_id: string; player_name: string; score: number; correct_answers: number };

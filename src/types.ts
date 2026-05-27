export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  topic?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic?: string;
}

export type AppMode = 'flashcards' | 'quiz';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GenerationRequest {
  mode: AppMode;
  difficulty: Difficulty;
  count: number;
  text?: string;
  fileBase64?: string; // Send raw PDF Base64
  fileName?: string;
}

export interface GenerationResponse {
  success: boolean;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  error?: string;
  topic?: string;
  summary?: string;
}

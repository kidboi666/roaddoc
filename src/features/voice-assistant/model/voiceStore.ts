import { create } from 'zustand';
import type { VoiceStatus } from '@/shared/config';

interface PreviousContext {
  question: string;
  answer: string;
}

interface VoiceState {
  // 현재 상태
  state: VoiceStatus;

  // 현재 대화
  currentQuestion: string | null;
  currentAnswer: string | null;

  // 이전 대화 컨텍스트 (후속 질문용)
  previousContext: PreviousContext | null;

  // 에러 상태
  error: string | null;

  // 액션
  setState: (state: VoiceStatus) => void;
  setCurrentQuestion: (question: string | null) => void;
  setCurrentAnswer: (answer: string | null) => void;
  setPreviousContext: (context: PreviousContext | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  state: 'idle',
  currentQuestion: null,
  currentAnswer: null,
  previousContext: null,
  error: null,

  setState: (state) => set({ state }),

  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),

  setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),

  setPreviousContext: (previousContext) => set({ previousContext }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      state: 'idle',
      currentQuestion: null,
      currentAnswer: null,
      error: null,
      // previousContext는 유지 (후속 질문용)
    }),
}));

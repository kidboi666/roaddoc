import { create } from 'zustand';
import type { VoiceStatus } from '@/shared/config';

interface PreviousContext {
  question: string;
  answer: string;
}

interface VoiceState {
  state: VoiceStatus;
  currentQuestion: string | null;
  currentAnswer: string | null;
  previousContext: PreviousContext | null;
  error: string | null;
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
    }),
}));

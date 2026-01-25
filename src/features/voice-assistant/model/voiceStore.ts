import { create } from 'zustand';
import type { VoiceStatus } from '@/shared/config';

interface PreviousContext {
  question: string;
  answer: string;
}

export interface Message {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: number;
}

interface VoiceState {
  state: VoiceStatus;
  currentQuestion: string | null;
  currentAnswer: string | null;
  previousContext: PreviousContext | null;
  messages: Message[];
  error: string | null;
  setState: (state: VoiceStatus) => void;
  setCurrentQuestion: (question: string | null) => void;
  setCurrentAnswer: (answer: string | null) => void;
  setPreviousContext: (context: PreviousContext | null) => void;
  addMessage: (type: 'question' | 'answer', content: string) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  state: 'idle',
  currentQuestion: null,
  currentAnswer: null,
  previousContext: null,
  messages: [],
  error: null,

  setState: (state) => set({ state }),

  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),

  setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),

  setPreviousContext: (previousContext) => set({ previousContext }),

  addMessage: (type, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${type}`,
          type,
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      state: 'idle',
      currentQuestion: null,
      currentAnswer: null,
      error: null,
    }),
}));

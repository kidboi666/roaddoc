import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { VoiceStatus } from '../config';

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
}

interface VoiceActions {
  setState: (state: VoiceStatus) => void;
  setCurrentQuestion: (question: string | null) => void;
  setCurrentAnswer: (answer: string | null) => void;
  setPreviousContext: (context: PreviousContext | null) => void;
  addMessage: (type: 'question' | 'answer', content: string) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type VoiceStore = VoiceState & VoiceActions;

const voiceStore = create<VoiceStore>((set) => ({
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
      set((s) => ({
        messages: [
          ...s.messages,
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

export const useVoiceState = () =>
    voiceStore(
        useShallow((s) => ({
          state: s.state,
          currentQuestion: s.currentQuestion,
          currentAnswer: s.currentAnswer,
          error: s.error,
        }))
    );

export const useVoiceMessages = () => voiceStore((s) => s.messages);

export const usePreviousContext = () => voiceStore((s) => s.previousContext);

export const useVoiceActions = () =>
    voiceStore(
        useShallow((s) => ({
          setState: s.setState,
          setCurrentQuestion: s.setCurrentQuestion,
          setCurrentAnswer: s.setCurrentAnswer,
          setPreviousContext: s.setPreviousContext,
          addMessage: s.addMessage,
          clearMessages: s.clearMessages,
          setError: s.setError,
          reset: s.reset,
        }))
    );

export const useVoiceStore = voiceStore;

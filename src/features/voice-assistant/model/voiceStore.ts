import { create } from 'zustand';
import type { VoiceStatus } from '@/shared/config';

interface Conversation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

interface VoiceState {
  // 앱 상태
  status: VoiceStatus;

  // 현재 세션 대화
  conversations: Conversation[];

  // 마지막 대화 (후속 질문용)
  lastConversation: {
    question: string;
    answer: string;
  } | null;

  // 에러 상태
  error: string | null;

  // 액션
  setStatus: (status: VoiceStatus) => void;
  addConversation: (question: string, answer: string) => void;
  clearConversations: () => void;
  setError: (error: string | null) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  status: 'idle',
  conversations: [],
  lastConversation: null,
  error: null,

  setStatus: (status) => set({ status }),

  addConversation: (question, answer) =>
    set((state) => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        question,
        answer,
        timestamp: new Date(),
      };

      return {
        conversations: [...state.conversations, newConversation],
        lastConversation: { question, answer },
      };
    }),

  clearConversations: () =>
    set({
      conversations: [],
      lastConversation: null,
    }),

  setError: (error) => set({ error }),
}));

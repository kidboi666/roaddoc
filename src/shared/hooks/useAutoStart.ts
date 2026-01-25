import { create } from 'zustand';

interface AutoStartState {
  shouldAutoStartRecording: boolean;
  setShouldAutoStartRecording: (value: boolean) => void;
  clearAutoStart: () => void;
}

export const useAutoStartStore = create<AutoStartState>((set) => ({
  shouldAutoStartRecording: false,
  setShouldAutoStartRecording: (value) => set({ shouldAutoStartRecording: value }),
  clearAutoStart: () => set({ shouldAutoStartRecording: false }),
}));

export function useAutoStart() {
  const { shouldAutoStartRecording, setShouldAutoStartRecording, clearAutoStart } =
      useAutoStartStore();

  return {
    shouldAutoStartRecording,
    setShouldAutoStartRecording,
    clearAutoStart,
  };
}

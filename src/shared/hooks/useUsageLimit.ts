import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import {
  UsageLimitState,
  UsageLimitResult,
  loadUsageState,
  saveUsageState,
  canUseApi,
  incrementUsage,
  getUsageLimitError,
  getTodayDateString,
} from '@/shared/lib/usageLimit';

interface UsageLimitStore {
  state: UsageLimitState;
  isLoaded: boolean;
  setState: (state: UsageLimitState) => void;
  setLoaded: (loaded: boolean) => void;
}

const useUsageLimitStore = create<UsageLimitStore>((set) => ({
  state: {
    count: 0,
    date: getTodayDateString(),
    isPremium: false,
  },
  isLoaded: false,
  setState: (state) => set({ state }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));

interface UseUsageLimitReturn {
  isLoaded: boolean;
  usageCount: number;
  isPremium: boolean;
  canUse: () => UsageLimitResult;
  recordUsage: () => Promise<void>;
  getError: () => string;
  setIsPremium: (isPremium: boolean) => Promise<void>;
}

export function useUsageLimit(): UseUsageLimitReturn {
  const { state, isLoaded, setState, setLoaded } = useUsageLimitStore();

  useEffect(() => {
    if (!isLoaded) {
      loadUsageState().then((loadedState) => {
        setState(loadedState);
        setLoaded(true);
      });
    }
  }, [isLoaded, setState, setLoaded]);

  const canUse = useCallback((): UsageLimitResult => {
    return canUseApi(state);
  }, [state]);

  const recordUsage = useCallback(async (): Promise<void> => {
    const newState = incrementUsage(state);
    setState(newState);
    await saveUsageState(newState);
  }, [state, setState]);

  const getError = useCallback((): string => {
    const result = canUseApi(state);
    return getUsageLimitError(result);
  }, [state]);

  const setIsPremium = useCallback(
    async (isPremium: boolean): Promise<void> => {
      const newState = { ...state, isPremium };
      setState(newState);
      await saveUsageState(newState);
    },
    [state, setState]
  );

  return {
    isLoaded,
    usageCount: state.count,
    isPremium: state.isPremium,
    canUse,
    recordUsage,
    getError,
    setIsPremium,
  };
}

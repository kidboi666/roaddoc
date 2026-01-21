import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VOICE_CONFIG, type ThemeMode } from '@/shared/config';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@roaddoc/onboarding_completed',
  DISCLAIMER_ACCEPTED: '@roaddoc/disclaimer_accepted',
  TTS_SPEED: '@roaddoc/tts_speed',
  SILENCE_TIMEOUT: '@roaddoc/silence_timeout',
  THEME_MODE: '@roaddoc/theme_mode',
} as const;

export interface Settings {
  onboardingCompleted: boolean;
  disclaimerAccepted: boolean;
  ttsSpeed: number;
  silenceTimeout: number;
  themeMode: ThemeMode;
}

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  isInitialized: boolean;
  loadSettings: () => Promise<void>;
  setOnboardingCompleted: (value: boolean) => Promise<void>;
  setDisclaimerAccepted: (value: boolean) => Promise<void>;
  setTtsSpeed: (value: number) => Promise<void>;
  setSilenceTimeout: (value: number) => Promise<void>;
  setThemeMode: (value: ThemeMode) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  onboardingCompleted: false,
  disclaimerAccepted: false,
  ttsSpeed: VOICE_CONFIG.ttsSpeed,
  silenceTimeout: VOICE_CONFIG.silenceTimeout,
  themeMode: 'system',
};

const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isInitialized: false,

  loadSettings: async () => {
    if (get().isInitialized) return;

    try {
      const [
        onboardingCompleted,
        disclaimerAccepted,
        ttsSpeed,
        silenceTimeout,
        themeMode,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
        AsyncStorage.getItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED),
        AsyncStorage.getItem(STORAGE_KEYS.TTS_SPEED),
        AsyncStorage.getItem(STORAGE_KEYS.SILENCE_TIMEOUT),
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
      ]);

      set({
        settings: {
          onboardingCompleted: onboardingCompleted === 'true',
          disclaimerAccepted: disclaimerAccepted === 'true',
          ttsSpeed: ttsSpeed ? parseFloat(ttsSpeed) : DEFAULT_SETTINGS.ttsSpeed,
          silenceTimeout: silenceTimeout
            ? parseInt(silenceTimeout, 10)
            : DEFAULT_SETTINGS.silenceTimeout,
          themeMode: (themeMode as ThemeMode) || DEFAULT_SETTINGS.themeMode,
        },
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setOnboardingCompleted: async (value: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(value));
    set((state) => ({
      settings: { ...state.settings, onboardingCompleted: value },
    }));
  },

  setDisclaimerAccepted: async (value: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED, String(value));
    set((state) => ({
      settings: { ...state.settings, disclaimerAccepted: value },
    }));
  },

  setTtsSpeed: async (value: number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TTS_SPEED, String(value));
    set((state) => ({
      settings: { ...state.settings, ttsSpeed: value },
    }));
  },

  setSilenceTimeout: async (value: number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SILENCE_TIMEOUT, String(value));
    set((state) => ({
      settings: { ...state.settings, silenceTimeout: value },
    }));
  },

  setThemeMode: async (value: ThemeMode) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, value);
    set((state) => ({
      settings: { ...state.settings, themeMode: value },
    }));
  },
}));

export function useSettings() {
  const store = useSettingsStore();
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    store.loadSettings();
  }, []);

  const effectiveColorScheme = useMemo(() => {
    if (store.settings.themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return store.settings.themeMode;
  }, [store.settings.themeMode, systemColorScheme]);

  const isDark = effectiveColorScheme === 'dark';

  return {
    settings: store.settings,
    isLoading: store.isLoading,
    effectiveColorScheme,
    isDark,
    setOnboardingCompleted: store.setOnboardingCompleted,
    setDisclaimerAccepted: store.setDisclaimerAccepted,
    setTtsSpeed: store.setTtsSpeed,
    setSilenceTimeout: store.setSilenceTimeout,
    setThemeMode: store.setThemeMode,
  };
}

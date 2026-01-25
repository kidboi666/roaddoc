import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VOICE_CONFIG } from '@/shared/config/constants';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

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
  loadSettings: () => Promise<void>;
  setOnboardingCompleted: (value: boolean) => Promise<void>;
  setDisclaimerAccepted: (value: boolean) => Promise<void>;
  setTtsSpeed: (value: number) => Promise<void>;
  setSilenceTimeout: (value: number) => Promise<void>;
  setThemeMode: (value: ThemeMode) => Promise<void>;
}

const STORAGE_PREFIX = '@roaddoc';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: `${STORAGE_PREFIX}/onboarding_completed`,
  DISCLAIMER_ACCEPTED: `${STORAGE_PREFIX}/disclaimer_accepted`,
  TTS_SPEED: `${STORAGE_PREFIX}/tts_speed`,
  SILENCE_TIMEOUT: `${STORAGE_PREFIX}/silence_timeout`,
  THEME_MODE: `${STORAGE_PREFIX}/theme_mode`,
} as const;

const DEFAULT_SETTINGS: Settings = {
  onboardingCompleted: false,
  disclaimerAccepted: false,
  ttsSpeed: VOICE_CONFIG.ttsSpeed,
  silenceTimeout: VOICE_CONFIG.silenceTimeout,
  themeMode: 'system',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    if (!get().isLoading) return;

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
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
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

export function useSettings(systemColorScheme?: ColorScheme | null) {
  const {
    settings,
    isLoading,
    loadSettings,
    setOnboardingCompleted,
    setDisclaimerAccepted,
    setTtsSpeed,
    setSilenceTimeout,
    setThemeMode,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const effectiveColorScheme = useMemo((): ColorScheme => {
    if (settings.themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return settings.themeMode;
  }, [settings.themeMode, systemColorScheme]);

  const isDark = effectiveColorScheme === 'dark';

  return {
    settings,
    isLoading,
    effectiveColorScheme,
    isDark,
    setOnboardingCompleted,
    setDisclaimerAccepted,
    setTtsSpeed,
    setSilenceTimeout,
    setThemeMode,
  };
}

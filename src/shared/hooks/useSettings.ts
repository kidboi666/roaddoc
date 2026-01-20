import { useEffect, useState, useCallback } from 'react';
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

const DEFAULT_SETTINGS: Settings = {
  onboardingCompleted: false,
  disclaimerAccepted: false,
  ttsSpeed: VOICE_CONFIG.ttsSpeed,
  silenceTimeout: VOICE_CONFIG.silenceTimeout,
  themeMode: 'system',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
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

        setSettings({
          onboardingCompleted: onboardingCompleted === 'true',
          disclaimerAccepted: disclaimerAccepted === 'true',
          ttsSpeed: ttsSpeed ? parseFloat(ttsSpeed) : DEFAULT_SETTINGS.ttsSpeed,
          silenceTimeout: silenceTimeout
            ? parseInt(silenceTimeout, 10)
            : DEFAULT_SETTINGS.silenceTimeout,
          themeMode: (themeMode as ThemeMode) || DEFAULT_SETTINGS.themeMode,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setOnboardingCompleted = useCallback(async (value: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(value));
    setSettings((prev) => ({ ...prev, onboardingCompleted: value }));
  }, []);

  const setDisclaimerAccepted = useCallback(async (value: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED, String(value));
    setSettings((prev) => ({ ...prev, disclaimerAccepted: value }));
  }, []);

  const setTtsSpeed = useCallback(async (value: number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.TTS_SPEED, String(value));
    setSettings((prev) => ({ ...prev, ttsSpeed: value }));
  }, []);

  const setSilenceTimeout = useCallback(async (value: number) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SILENCE_TIMEOUT, String(value));
    setSettings((prev) => ({ ...prev, silenceTimeout: value }));
  }, []);

  const setThemeMode = useCallback(async (value: ThemeMode) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, value);
    setSettings((prev) => ({ ...prev, themeMode: value }));
  }, []);

  return {
    settings,
    isLoading,
    setOnboardingCompleted,
    setDisclaimerAccepted,
    setTtsSpeed,
    setSilenceTimeout,
    setThemeMode,
  };
}

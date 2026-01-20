import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { VOICE_CONFIG } from '@/shared/config';

interface UseTTSOptions {
  speed?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

interface UseTTSReturn {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { speed = VOICE_CONFIG.ttsSpeed, onStart, onDone, onError } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);

  // 컴포넌트 언마운트 시 TTS 중지
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(
    async (text: string) => {
      try {
        // 이미 말하고 있다면 중지
        if (isSpeaking) {
          await Speech.stop();
        }

        setIsSpeaking(true);
        onStart?.();

        await new Promise<void>((resolve, reject) => {
          Speech.speak(text, {
            language: VOICE_CONFIG.language,
            rate: speed,
            pitch: 1.0,
            onStart: () => {
              // 이미 setIsSpeaking(true) 호출됨
            },
            onDone: () => {
              setIsSpeaking(false);
              onDone?.();
              resolve();
            },
            onError: (error) => {
              setIsSpeaking(false);
              onError?.(new Error(error.message));
              reject(error);
            },
            onStopped: () => {
              setIsSpeaking(false);
              resolve();
            },
          });
        });
      } catch (error) {
        setIsSpeaking(false);
        console.error('TTS error:', error);
        onError?.(error instanceof Error ? error : new Error('TTS failed'));
      }
    },
    [speed, isSpeaking, onStart, onDone, onError]
  );

  const stop = useCallback(async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Failed to stop TTS:', error);
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
  };
}

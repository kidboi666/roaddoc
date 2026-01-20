import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';

interface UseAudioRecorderOptions {
  silenceTimeout?: number;
  onSilenceDetected?: () => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const { silenceTimeout = 1500, onSilenceDetected } = options;

  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useExpoAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(audioRecorder, 100);

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSoundTimeRef = useRef<number>(Date.now());

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRecording || !recorderState) return;

    const currentLevel = recorderState.metering ?? -160;
    const SILENCE_THRESHOLD = -40;

    if (currentLevel > SILENCE_THRESHOLD) {
      lastSoundTimeRef.current = Date.now();
      clearSilenceTimer();
    } else {
      const silentDuration = Date.now() - lastSoundTimeRef.current;

      if (silentDuration >= silenceTimeout && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (isRecording && onSilenceDetected) {
            onSilenceDetected();
          }
        }, 0);
      }
    }
  }, [recorderState, isRecording, silenceTimeout, onSilenceDetected, clearSilenceTimer]);

  const startRecording = useCallback(async () => {
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
      });

      audioRecorder.record();
      setIsRecording(true);
      lastSoundTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      clearSilenceTimer();

      if (!audioRecorder.isRecording) {
        setIsRecording(false);
        return null;
      }

      const uri = await audioRecorder.stop();
      setIsRecording(false);

      return uri ?? null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      return null;
    }
  }, [audioRecorder, clearSilenceTimer]);

  const cancelRecording = useCallback(async () => {
    try {
      clearSilenceTimer();

      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      setIsRecording(false);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      setIsRecording(false);
    }
  }, [audioRecorder, clearSilenceTimer]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
    };
  }, [clearSilenceTimer]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

export function getAudioFileExtension(): string {
  return Platform.OS === 'ios' ? 'm4a' : 'webm';
}

export function getAudioMimeType(): string {
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/webm';
}

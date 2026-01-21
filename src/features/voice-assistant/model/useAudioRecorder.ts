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
  const recordingStartTimeRef = useRef<number>(0);
  const hasPassedGracePeriodRef = useRef(false);
  const GRACE_PERIOD = 1000;
  const SILENCE_THRESHOLD = -45;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRecording || !recorderState) return;

    const now = Date.now();
    const timeSinceStart = now - recordingStartTimeRef.current;

    if (timeSinceStart < GRACE_PERIOD) return;

    if (!hasPassedGracePeriodRef.current) {
      hasPassedGracePeriodRef.current = true;
      lastSoundTimeRef.current = now;
    }

    const currentLevel = recorderState.metering ?? -160;

    if (__DEV__) {
      console.log(`[Audio] metering: ${currentLevel.toFixed(1)}, threshold: ${SILENCE_THRESHOLD}`);
    }

    if (currentLevel > SILENCE_THRESHOLD) {
      lastSoundTimeRef.current = now;
      clearSilenceTimer();
    } else {
      const silentDuration = now - lastSoundTimeRef.current;

      if (__DEV__) {
        console.log(`[Audio] silent for: ${silentDuration}ms, timeout: ${silenceTimeout}ms`);
      }

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
        allowsRecording: true,
      });

      const now = Date.now();
      recordingStartTimeRef.current = now;
      lastSoundTimeRef.current = now;
      hasPassedGracePeriodRef.current = false;
      clearSilenceTimer();

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);

      if (__DEV__) {
        console.log('[Audio] Recording started');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [audioRecorder, clearSilenceTimer]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      clearSilenceTimer();
      setIsRecording(false);

      if (!audioRecorder.isRecording) {
        if (__DEV__) {
          console.log('[Audio] Recorder was not recording');
        }
        return null;
      }

      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (__DEV__) {
        console.log('[Audio] Recording stopped, URI:', uri);
      }

      return uri ?? null;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }, [audioRecorder, clearSilenceTimer]);

  const cancelRecording = useCallback(async () => {
    try {
      clearSilenceTimer();
      setIsRecording(false);

      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      if (__DEV__) {
        console.log('[Audio] Recording cancelled');
      }
    } catch (error) {
      console.error('Failed to cancel recording:', error);
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

import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAudioRecorder as useExpoAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';

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

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const { silenceTimeout = 1500, onSilenceDetected } = options;

  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioLevelRef = useRef<number>(0);

  // 침묵 감지 타이머 시작
  const startSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      if (isRecording && onSilenceDetected) {
        onSilenceDetected();
      }
    }, silenceTimeout);
  }, [silenceTimeout, isRecording, onSilenceDetected]);

  // 침묵 감지 타이머 리셋
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    startSilenceDetection();
  }, [startSilenceDetection]);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      // 오디오 세션 설정
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
      });

      // 녹음 시작
      audioRecorder.record();
      setIsRecording(true);

      // 침묵 감지 시작
      startSilenceDetection();

      // 오디오 레벨 모니터링 (침묵 감지용)
      const checkAudioLevel = setInterval(() => {
        if (!audioRecorder.isRecording) {
          clearInterval(checkAudioLevel);
          return;
        }

        const currentLevel = audioRecorder.currentMetering ?? -160;

        // 소리가 감지되면 타이머 리셋 (임계값: -40dB)
        if (currentLevel > -40) {
          resetSilenceTimer();
        }

        lastAudioLevelRef.current = currentLevel;
      }, 100);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [audioRecorder, startSilenceDetection, resetSilenceTimer]);

  // 녹음 중지 및 파일 반환
  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

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
  }, [audioRecorder]);

  // 녹음 취소
  const cancelRecording = useCallback(async () => {
    try {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      setIsRecording(false);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      setIsRecording(false);
    }
  }, [audioRecorder]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

// 플랫폼별 오디오 파일 확장자
export function getAudioFileExtension(): string {
  return Platform.OS === 'ios' ? 'm4a' : 'webm';
}

// 플랫폼별 MIME 타입
export function getAudioMimeType(): string {
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/webm';
}

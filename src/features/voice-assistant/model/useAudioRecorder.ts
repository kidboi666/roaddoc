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

// 미터링 활성화된 녹음 프리셋
const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const { silenceTimeout = 1500, onSilenceDetected } = options;

  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useExpoAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(audioRecorder, 100); // 100ms 간격으로 상태 체크

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSoundTimeRef = useRef<number>(Date.now());

  // 침묵 감지 타이머 클리어
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // 침묵 감지 로직
  useEffect(() => {
    if (!isRecording || !recorderState) return;

    const currentLevel = recorderState.metering ?? -160;

    // 소리가 감지되면 (임계값: -40dB) 마지막 소리 시간 업데이트
    if (currentLevel > -40) {
      lastSoundTimeRef.current = Date.now();
      clearSilenceTimer();
    } else {
      // 침묵이 지속되면 타이머 시작
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
      lastSoundTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [audioRecorder]);

  // 녹음 중지 및 파일 반환
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

  // 녹음 취소
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

  // 컴포넌트 언마운트 시 정리
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

// 플랫폼별 오디오 파일 확장자
export function getAudioFileExtension(): string {
  return Platform.OS === 'ios' ? 'm4a' : 'webm';
}

// 플랫폼별 MIME 타입
export function getAudioMimeType(): string {
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/webm';
}

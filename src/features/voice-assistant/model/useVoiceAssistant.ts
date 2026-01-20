import { useCallback, useRef, useEffect } from 'react';
import { useVoiceStore } from './voiceStore';
import { useAudioRecorder } from './useAudioRecorder';
import { useTTS } from './useTTS';
import { useSoundEffects } from '@/shared/sounds/effects';
import { transcribeAudio } from '../api/transcribe';
import { generateAnswer, isFollowUpCommand } from '../api/generateAnswer';
import { useSettings } from '@/shared/hooks/useSettings';

interface UseVoiceAssistantReturn {
  // 상태
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  isRecording: boolean;
  isSpeaking: boolean;
  currentQuestion: string | null;
  currentAnswer: string | null;
  error: string | null;

  // 액션
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancel: () => Promise<void>;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const { settings } = useSettings();
  const { playSound } = useSoundEffects();

  // Zustand 스토어
  const {
    state,
    currentQuestion,
    currentAnswer,
    error,
    previousContext,
    setState,
    setCurrentQuestion,
    setCurrentAnswer,
    setError,
    setPreviousContext,
    reset,
  } = useVoiceStore();

  // 처리 중 플래그 (중복 처리 방지)
  const isProcessingRef = useRef(false);
  // processRecording 함수를 ref로 저장 (순환 종속성 해결)
  const processRecordingRef = useRef<(() => Promise<void>) | null>(null);

  // TTS 훅
  const { isSpeaking, speak, stop: stopTTS } = useTTS({
    speed: settings.ttsSpeed,
    onDone: () => {
      setState('idle');
    },
    onError: () => {
      setState('idle');
    },
  });

  // 침묵 감지 시 자동 처리
  const handleSilenceDetected = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (processRecordingRef.current) {
      await processRecordingRef.current();
    }
  }, []);

  // 녹음 훅
  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder({
    silenceTimeout: settings.silenceTimeout,
    onSilenceDetected: handleSilenceDetected,
  });

  // 녹음 처리 (STT → GPT → TTS)
  const processRecording = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // 녹음 중지
      const audioUri = await stopRecording();
      if (!audioUri) {
        setError('녹음 파일을 찾을 수 없습니다.');
        setState('idle');
        isProcessingRef.current = false;
        return;
      }

      // 처리 중 상태
      setState('processing');
      await playSound('processing');

      // STT: 음성 → 텍스트
      const transcriptionResult = await transcribeAudio(audioUri);
      if (!transcriptionResult.success) {
        setError(transcriptionResult.error || '음성 인식에 실패했습니다.');
        await playSound('error');
        setState('idle');
        isProcessingRef.current = false;
        return;
      }

      const question = transcriptionResult.text;
      setCurrentQuestion(question);

      // 후속 질문인지 확인
      const isFollowUp = isFollowUpCommand(question);
      const context = isFollowUp ? previousContext : null;

      // GPT: 답변 생성
      const answerResult = await generateAnswer({
        question,
        previousContext: context,
        detailed: isFollowUp,
      });

      if (!answerResult.success) {
        setError(answerResult.error || '답변 생성에 실패했습니다.');
        await playSound('error');
        setState('idle');
        isProcessingRef.current = false;
        return;
      }

      const answer = answerResult.answer;
      setCurrentAnswer(answer);

      // 컨텍스트 저장 (후속 질문용)
      setPreviousContext({ question, answer });

      // TTS: 답변 음성 출력
      setState('speaking');
      await speak(answer);
    } catch (err) {
      console.error('Voice assistant error:', err);
      setError('처리 중 오류가 발생했습니다.');
      await playSound('error');
      setState('idle');
    } finally {
      isProcessingRef.current = false;
    }
  }, [
    stopRecording,
    playSound,
    setError,
    setState,
    setCurrentQuestion,
    setCurrentAnswer,
    setPreviousContext,
    previousContext,
    speak,
  ]);

  // processRecording ref 업데이트
  useEffect(() => {
    processRecordingRef.current = processRecording;
  }, [processRecording]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    try {
      reset();
      setState('recording');
      await playSound('start');
      await startRecording();
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError('마이크를 시작할 수 없습니다.');
      await playSound('error');
      setState('idle');
    }
  }, [reset, setState, playSound, startRecording, setError]);

  // 음성 인식 중지 (수동)
  const stopListening = useCallback(async () => {
    if (state !== 'recording') return;

    await playSound('end');
    await processRecording();
  }, [state, playSound, processRecording]);

  // 전체 취소
  const cancel = useCallback(async () => {
    if (isSpeaking) {
      await stopTTS();
    }
    if (isRecording) {
      await cancelRecording();
    }
    reset();
  }, [isSpeaking, stopTTS, isRecording, cancelRecording, reset]);

  return {
    state,
    isRecording,
    isSpeaking,
    currentQuestion,
    currentAnswer,
    error,
    startListening,
    stopListening,
    cancel,
  };
}

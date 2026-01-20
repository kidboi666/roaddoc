import { useCallback, useRef, useEffect } from 'react';
import { useVoiceStore } from './voiceStore';
import { useAudioRecorder } from './useAudioRecorder';
import { useTTS } from './useTTS';
import { useSoundEffects } from '@/shared/sounds/effects';
import { transcribeAudio } from '../api/transcribe';
import { generateAnswer, isFollowUpCommand } from '../api/generateAnswer';
import { useSettings } from '@/shared/hooks/useSettings';

interface UseVoiceAssistantReturn {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  isRecording: boolean;
  isSpeaking: boolean;
  currentQuestion: string | null;
  currentAnswer: string | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancel: () => Promise<void>;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const { settings } = useSettings();
  const { playSound } = useSoundEffects();

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

  const isProcessingRef = useRef(false);
  const processRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const { isSpeaking, speak, stop: stopTTS } = useTTS({
    speed: settings.ttsSpeed,
    onDone: () => {
      setState('idle');
    },
    onError: () => {
      setState('idle');
    },
  });

  const handleSilenceDetected = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (processRecordingRef.current) {
      await processRecordingRef.current();
    }
  }, []);

  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder({
    silenceTimeout: settings.silenceTimeout,
    onSilenceDetected: handleSilenceDetected,
  });

  const processRecording = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const audioUri = await stopRecording();
      if (!audioUri) {
        setError('녹음 파일을 찾을 수 없습니다.');
        setState('idle');
        isProcessingRef.current = false;
        return;
      }

      setState('processing');
      await playSound('processing');

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

      const isFollowUp = isFollowUpCommand(question);
      const context = isFollowUp ? previousContext : null;

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
      setPreviousContext({ question, answer });

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

  useEffect(() => {
    processRecordingRef.current = processRecording;
  }, [processRecording]);

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

  const stopListening = useCallback(async () => {
    if (state !== 'recording') return;

    await playSound('end');
    await processRecording();
  }, [state, playSound, processRecording]);

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

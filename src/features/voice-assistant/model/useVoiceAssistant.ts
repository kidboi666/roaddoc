import { useCallback, useRef, useEffect } from 'react';
import { useVoiceState, useVoiceActions, usePreviousContext } from './voiceStore';
import { useAudioRecorder } from './useAudioRecorder';
import { useTTS } from './useTTS';
import { useHaptics } from './haptics';
import { transcribeAudio } from '../api/transcribe';
import { generateAnswer, isFollowUpCommand } from '../api/generateAnswer';
import {useSettings} from "@/shared/hooks";

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
  askQuestion: (question: string) => Promise<void>;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const { settings } = useSettings();
  const { play: playHaptic } = useHaptics();

  const { state, currentQuestion, currentAnswer, error } = useVoiceState();
  const previousContext = usePreviousContext();
  const actions = useVoiceActions();

  const isProcessingRef = useRef(false);
  const currentRequestIdRef = useRef<string | null>(null);
  const processRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const { isSpeaking, speak, stop: stopTTS } = useTTS({
    speed: settings.ttsSpeed,
    onDone: () => {
      actions.setState('idle');
    },
    onError: () => {
      actions.setState('idle');
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

  const processQuestion = useCallback(async (
      question: string,
      context: { question: string; answer: string } | null,
      requestId: string
  ) => {
    if (currentRequestIdRef.current !== requestId) return null;

    const isFollowUp = isFollowUpCommand(question);
    const effectiveContext = isFollowUp ? context : null;

    const answerResult = await generateAnswer({
      question,
      previousContext: effectiveContext,
      detailed: isFollowUp,
    });

    if (currentRequestIdRef.current !== requestId) return null;

    if (!answerResult.success) {
      actions.setError(answerResult.error || '답변 생성에 실패했습니다.');
      await playHaptic('error');
      actions.setState('idle');
      return null;
    }

    const answer = answerResult.answer;
    actions.setCurrentAnswer(answer);
    actions.addMessage('answer', answer);
    actions.setPreviousContext({ question, answer });

    actions.setState('speaking');
    await speak(answer);

    return answer;
  }, [actions, playHaptic, speak]);

  const processRecording = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const requestId = `${Date.now()}-${Math.random()}`;
    currentRequestIdRef.current = requestId;

    try {
      const audioUri = await stopRecording();
      if (!audioUri) {
        actions.setError('녹음 파일을 찾을 수 없습니다.');
        actions.setState('idle');
        return;
      }

      if (currentRequestIdRef.current !== requestId) return;

      actions.setState('processing');
      await playHaptic('processing');

      const transcriptionResult = await transcribeAudio(audioUri);

      if (currentRequestIdRef.current !== requestId) return;

      if (!transcriptionResult.success) {
        actions.setError(transcriptionResult.error || '음성 인식에 실패했습니다.');
        await playHaptic('error');
        actions.setState('idle');
        return;
      }

      const question = transcriptionResult.text;
      actions.setCurrentQuestion(question);
      actions.addMessage('question', question);

      await processQuestion(question, previousContext, requestId);
    } catch (err) {
      if (currentRequestIdRef.current === requestId) {
        console.error('Voice assistant error:', err);
        actions.setError('처리 중 오류가 발생했습니다.');
        await playHaptic('error');
        actions.setState('idle');
      }
    } finally {
      if (currentRequestIdRef.current === requestId) {
        isProcessingRef.current = false;
      }
    }
  }, [stopRecording, actions, playHaptic, previousContext, processQuestion]);

  useEffect(() => {
    processRecordingRef.current = processRecording;
  }, [processRecording]);

  const startListening = useCallback(async () => {
    try {
      currentRequestIdRef.current = null;
      actions.reset();
      actions.setState('recording');
      await playHaptic('start');
      await startRecording();
    } catch (err) {
      console.error('Failed to start listening:', err);
      actions.setError('마이크를 시작할 수 없습니다.');
      await playHaptic('error');
      actions.setState('idle');
    }
  }, [actions, playHaptic, startRecording]);

  const stopListening = useCallback(async () => {
    if (state !== 'recording') return;

    await playHaptic('end');
    await processRecording();
  }, [state, playHaptic, processRecording]);

  const cancel = useCallback(async () => {
    currentRequestIdRef.current = null;
    isProcessingRef.current = false;

    if (isSpeaking) {
      await stopTTS();
    }
    if (isRecording) {
      await cancelRecording();
    }
    actions.reset();
  }, [isSpeaking, stopTTS, isRecording, cancelRecording, actions]);

  const askQuestion = useCallback(async (question: string) => {
    if (isProcessingRef.current || !question.trim()) return;
    isProcessingRef.current = true;

    const requestId = `${Date.now()}-${Math.random()}`;
    currentRequestIdRef.current = requestId;

    try {
      actions.reset();
      actions.setCurrentQuestion(question);
      actions.addMessage('question', question);
      actions.setState('processing');
      await playHaptic('processing');

      await processQuestion(question, previousContext, requestId);
    } catch (err) {
      if (currentRequestIdRef.current === requestId) {
        console.error('Ask question error:', err);
        actions.setError('처리 중 오류가 발생했습니다.');
        await playHaptic('error');
        actions.setState('idle');
      }
    } finally {
      if (currentRequestIdRef.current === requestId) {
        isProcessingRef.current = false;
      }
    }
  }, [actions, playHaptic, previousContext, processQuestion]);

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
    askQuestion,
  };
}

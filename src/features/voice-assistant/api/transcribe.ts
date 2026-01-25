import { parseHttpStatus } from '@/shared/api/errorHandler';
import { getVoiceConfig } from '../config';
import { getAudioFileExtension, getAudioMimeType } from '../model/useAudioRecorder';

interface TranscribeResult {
  text: string;
  success: boolean;
  error?: string;
}

const HALLUCINATION_PATTERNS = [
  '시청해주셔서 감사합니다',
  '시청해 주셔서 감사합니다',
  '구독과 좋아요',
  '좋아요와 구독',
  '구독 부탁',
  '감사합니다',
  'Thank you for watching',
  'Thanks for watching',
  'Subscribe',
  '...',
  '.',
];

function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length < 3) return true;

  for (const pattern of HALLUCINATION_PATTERNS) {
    if (trimmed === pattern || trimmed.toLowerCase() === pattern.toLowerCase()) {
      return true;
    }
  }

  return false;
}

export async function transcribeAudio(audioUri: string): Promise<TranscribeResult> {
  const config = getVoiceConfig();
  let retryCount = 0;
  let lastError: string | undefined;

  while (retryCount < config.retryCount) {
    try {
      const formData = new FormData();

      formData.append('file', {
        uri: audioUri,
        type: getAudioMimeType(),
        name: `recording.${getAudioFileExtension()}`,
      } as unknown as Blob);

      formData.append('model', 'whisper-1');
      formData.append('language', config.language.split('-')[0]);
      formData.append('response_format', 'text');

      if (config.whisperPrompt) {
        formData.append('prompt', config.whisperPrompt);
      }

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const errorInfo = parseHttpStatus(response.status, errorBody);

        if (__DEV__) {
          console.error(`[Transcribe] API error ${response.status}:`, errorBody);
        }

        if (!errorInfo.shouldRetry) {
          return {
            text: '',
            success: false,
            error: errorInfo.userMessage,
          };
        }

        lastError = errorInfo.userMessage;
        throw new Error(errorInfo.userMessage);
      }

      const text = await response.text();

      if (!text || text.trim().length === 0) {
        return {
          text: '',
          success: false,
          error: '음성이 인식되지 않았습니다. 다시 말씀해 주세요.',
        };
      }

      const trimmedText = text.trim();

      if (isLikelyHallucination(trimmedText)) {
        if (__DEV__) {
          console.log('[Transcribe] Detected hallucination:', trimmedText);
        }
        return {
          text: '',
          success: false,
          error: '음성이 제대로 인식되지 않았습니다. 조금 더 크게 말씀해 주세요.',
        };
      }

      if (__DEV__) {
        console.log('[Transcribe] Success:', trimmedText);
      }

      return {
        text: trimmedText,
        success: true,
      };
    } catch (error) {
      retryCount++;

      if (__DEV__) {
        console.error(`[Transcribe] Attempt ${retryCount} failed:`, error);
      }

      if (retryCount >= config.retryCount) {
        return {
          text: '',
          success: false,
          error: lastError || '음성 인식에 실패했습니다. 다시 시도해 주세요.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return {
    text: '',
    success: false,
    error: '음성 인식에 실패했습니다.',
  };
}

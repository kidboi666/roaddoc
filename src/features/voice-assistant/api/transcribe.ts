import { VOICE_CONFIG, OPENAI_CONFIG } from '@/shared/config';
import { parseHttpStatus } from '@/shared/api/errorHandler';
import { getAudioFileExtension, getAudioMimeType } from '../model/useAudioRecorder';

interface TranscribeResult {
  text: string;
  success: boolean;
  error?: string;
}

export async function transcribeAudio(audioUri: string): Promise<TranscribeResult> {
  let retryCount = 0;
  let lastError: string | undefined;

  while (retryCount < OPENAI_CONFIG.retryCount) {
    try {
      const formData = new FormData();

      formData.append('file', {
        uri: audioUri,
        type: getAudioMimeType(),
        name: `recording.${getAudioFileExtension()}`,
      } as unknown as Blob);

      formData.append('model', 'whisper-1');
      formData.append('language', VOICE_CONFIG.language.split('-')[0]);
      formData.append('response_format', 'text');

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

      if (__DEV__) {
        console.log('[Transcribe] Success:', text.trim());
      }

      return {
        text: text.trim(),
        success: true,
      };
    } catch (error) {
      retryCount++;

      if (__DEV__) {
        console.error(`[Transcribe] Attempt ${retryCount} failed:`, error);
      }

      if (retryCount >= OPENAI_CONFIG.retryCount) {
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

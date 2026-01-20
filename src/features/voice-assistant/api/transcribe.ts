import * as FileSystem from 'expo-file-system';
import { EncodingType } from 'expo-file-system';
import { openai } from '@/shared/api/openai';
import { VOICE_CONFIG, OPENAI_CONFIG } from '@/shared/config';
import { getAudioFileExtension, getAudioMimeType } from '../model/useAudioRecorder';

interface TranscribeResult {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Whisper API를 사용하여 음성을 텍스트로 변환
 */
export async function transcribeAudio(audioUri: string): Promise<TranscribeResult> {
  let retryCount = 0;

  while (retryCount < OPENAI_CONFIG.retryCount) {
    try {
      // 파일 정보 읽기
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        return {
          text: '',
          success: false,
          error: '오디오 파일을 찾을 수 없습니다.',
        };
      }

      // 파일을 base64로 읽기
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: EncodingType.Base64,
      });

      // base64를 Blob으로 변환
      const audioBlob = base64ToBlob(base64Audio, getAudioMimeType());

      // File 객체 생성
      const audioFile = new File(
        [audioBlob],
        `recording.${getAudioFileExtension()}`,
        { type: getAudioMimeType() }
      );

      // Whisper API 호출
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: VOICE_CONFIG.language.split('-')[0], // 'ko'
        response_format: 'text',
      });

      const text = typeof response === 'string' ? response : response.text;

      if (!text || text.trim().length === 0) {
        return {
          text: '',
          success: false,
          error: '음성이 인식되지 않았습니다.',
        };
      }

      return {
        text: text.trim(),
        success: true,
      };
    } catch (error) {
      retryCount++;
      console.error(`Transcription attempt ${retryCount} failed:`, error);

      if (retryCount >= OPENAI_CONFIG.retryCount) {
        return {
          text: '',
          success: false,
          error: '음성 인식에 실패했습니다. 다시 시도해 주세요.',
        };
      }

      // 재시도 전 대기
      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return {
    text: '',
    success: false,
    error: '음성 인식에 실패했습니다.',
  };
}

/**
 * Base64 문자열을 Blob으로 변환
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

import { SYSTEM_PROMPT } from './prompts';
import { VOICE_CONFIG, OPENAI_CONFIG } from './constants';
import { initVoiceConfig } from '@/features/voice-assistant/config';

export function initializeApp() {
  initVoiceConfig({
    systemPrompt: SYSTEM_PROMPT,
    model: OPENAI_CONFIG.model,
    temperature: OPENAI_CONFIG.temperature,
    maxTokens: OPENAI_CONFIG.maxTokens,
    maxTokensDetailed: OPENAI_CONFIG.maxTokensDetailed,
    retryCount: OPENAI_CONFIG.retryCount,
    language: VOICE_CONFIG.language,
    silenceTimeout: VOICE_CONFIG.silenceTimeout,
    ttsSpeed: VOICE_CONFIG.ttsSpeed,
    whisperPrompt: '도로교통법, 운전, 교통법규, 신호, 속도, 벌금, 벌점, 면허',
  });
}

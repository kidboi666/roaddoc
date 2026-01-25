export type VoiceStatus = 'idle' | 'recording' | 'processing' | 'speaking';

export interface VoiceConfig {
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxTokensDetailed?: number;
  retryCount?: number;
  language?: string;
  silenceTimeout?: number;
  ttsSpeed?: number;
  whisperPrompt?: string;
}

export const DEFAULT_VOICE_CONFIG: Required<Omit<VoiceConfig, 'systemPrompt'>> = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 150,
  maxTokensDetailed: 300,
  retryCount: 3,
  language: 'ko-KR',
  silenceTimeout: 1500,
  ttsSpeed: 1.0,
  whisperPrompt: '',
};

let voiceConfig: VoiceConfig | null = null;

export function initVoiceConfig(config: VoiceConfig) {
  voiceConfig = {
    ...DEFAULT_VOICE_CONFIG,
    ...config,
  };
}

export function getVoiceConfig(): Required<VoiceConfig> {
  if (!voiceConfig) {
    throw new Error('Voice config not initialized. Call initVoiceConfig first.');
  }
  return voiceConfig as Required<VoiceConfig>;
}

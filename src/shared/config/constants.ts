export const APP_INFO = {
  name: '로드닥',
  nameEn: 'RoadDoc',
  slogan: '도로 위 AI 주치의',
  version: '0.1.0',
  packageName: 'com.logmind.roaddoc',
} as const;

export const VOICE_CONFIG = {
  silenceTimeout: 1500,
  silenceTimeoutOptions: [1000, 1500, 2000],
  ttsSpeed: 1.0,
  ttsSpeedMin: 0.5,
  ttsSpeedMax: 2.0,
  language: 'ko-KR',
} as const;

export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 150,
  maxTokensDetailed: 300,
  retryCount: 3,
} as const;

export type VoiceStatus = 'idle' | 'recording' | 'processing' | 'speaking';

export type ThemeMode = 'system' | 'light' | 'dark';

export const DISCLAIMER = `본 앱은 도로교통법에 대한 일반적인 정보를 제공하며,
법률 자문을 대체하지 않습니다.

정확한 법률 내용은 국가법령정보센터 또는
관할 기관에서 확인하시기 바랍니다.

운전 중에는 안전에 유의하시고,
가능하면 정차 후 사용해 주세요.`;

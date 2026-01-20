// 앱 정보
export const APP_INFO = {
  name: '로드닥',
  nameEn: 'RoadDoc',
  slogan: '도로 위 AI 주치의',
  version: '0.1.0',
  packageName: 'com.logmind.roaddoc',
} as const;

// 음성 관련 설정
export const VOICE_CONFIG = {
  // 침묵 감지 시간 (ms)
  silenceTimeout: 1500,
  silenceTimeoutOptions: [1000, 1500, 2000],

  // TTS 속도
  ttsSpeed: 1.0,
  ttsSpeedMin: 0.5,
  ttsSpeedMax: 2.0,

  // 언어
  language: 'ko-KR',
} as const;

// OpenAI API 설정
export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 150,
  maxTokensDetailed: 300,
  retryCount: 3,
} as const;

// 오디오 포맷 (플랫폼별)
export const AUDIO_FORMAT = {
  ios: 'm4a',
  android: 'webm',
} as const;

// 앱 상태
export type VoiceStatus = 'idle' | 'recording' | 'processing' | 'speaking';

// 다크 모드 옵션
export type ThemeMode = 'system' | 'light' | 'dark';

// 면책 조항
export const DISCLAIMER = `본 앱은 도로교통법에 대한 일반적인 정보를 제공하며,
법률 자문을 대체하지 않습니다.

정확한 법률 내용은 국가법령정보센터 또는
관할 기관에서 확인하시기 바랍니다.

운전 중에는 안전에 유의하시고,
가능하면 정차 후 사용해 주세요.`;

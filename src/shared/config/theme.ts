// 심플 그레이 테마 색상
export const Colors = {
  light: {
    text: '#1a1a1a',
    textSecondary: '#666666',
    background: '#f5f5f5',
    surface: '#ffffff',
    border: '#e0e0e0',
    primary: '#333333',
    error: '#dc3545',
    // 마이크 버튼 상태별 색상
    micIdle: '#9e9e9e',
    micRecording: '#ef4444',
    micProcessing: '#3b82f6',
    micSpeaking: '#22c55e',
  },
  dark: {
    text: '#f5f5f5',
    textSecondary: '#a0a0a0',
    background: '#121212',
    surface: '#1e1e1e',
    border: '#333333',
    primary: '#e0e0e0',
    error: '#f87171',
    // 마이크 버튼 상태별 색상
    micIdle: '#6b7280',
    micRecording: '#ef4444',
    micProcessing: '#60a5fa',
    micSpeaking: '#4ade80',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

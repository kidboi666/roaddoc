// 심플 그레이 테마 색상
export const Colors = {
  // 공통 색상
  primary: '#3b82f6',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',

  light: {
    text: '#1a1a1a',
    textSecondary: '#666666',
    background: '#f5f5f5',
    card: '#ffffff',
    border: '#e0e0e0',
  },
  dark: {
    text: '#f5f5f5',
    textSecondary: '#a0a0a0',
    background: '#121212',
    card: '#1e1e1e',
    border: '#333333',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

import { vars } from 'nativewind';

export const Colors = {
  primary: '#3b82f6',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  orange: '#f97316',
  purple: '#8b5cf6',

  light: {
    text: '#1a1a1a',
    textSecondary: '#666666',
    background: '#f5f5f5',
    card: '#ffffff',
    secondary: '#f5f5f5',
    muted: '#a3a3a3',
    mutedForeground: '#737373',
    border: '#e5e5e5',
    icon: '#525252',
  },
  dark: {
    background: '#171717',
    foreground: '#fafafa',
    card: '#262626',
    secondary: '#262626',
    muted: '#525252',
    mutedForeground: '#a3a3a3',
    border: '#404040',
    icon: '#a3a3a3',
  },
} as const;

export const getColors = (isDark: boolean) => isDark ? Colors.dark : Colors.light;

export const ChatBubbleColors = {
  light: {
    question: '#fafafa',
    answer: '#eff6ff',
    answerBorder: '#dbeafe',
  },
  dark: {
    question: 'rgba(64, 64, 64, 0.5)',
    answer: 'rgba(23, 37, 84, 0.5)',
    answerBorder: '#1e3a8a',
  },
} as const;

export const ErrorColors = {
  light: {
    background: '#fef2f2',
    border: '#fecaca',
    text: '#dc2626',
  },
  dark: {
    background: '#450a0a',
    border: '#7f1d1d',
    text: '#fca5a5',
  },
} as const;

export const getChatBubbleColors = (isDark: boolean) => isDark ? ChatBubbleColors.dark : ChatBubbleColors.light;
export const getErrorColors = (isDark: boolean) => isDark ? ErrorColors.dark : ErrorColors.light;


export const themeVars = {
  light: vars({
    '--color-background': '250 250 250',
    '--color-foreground': '23 23 23',
    '--color-card': '255 255 255',
    '--color-card-foreground': '23 23 23',
    '--color-primary': '59 130 246',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '245 245 245',
    '--color-secondary-foreground': '23 23 23',
    '--color-muted': '163 163 163',
    '--color-muted-foreground': '115 115 115',
    '--color-destructive': '239 68 68',
    '--color-success': '34 197 94',
    '--color-border': '229 229 229',
  }),
  dark: vars({
    '--color-background': '23 23 23',
    '--color-foreground': '250 250 250',
    '--color-card': '38 38 38',
    '--color-card-foreground': '250 250 250',
    '--color-primary': '59 130 246',
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '38 38 38',
    '--color-secondary-foreground': '250 250 250',
    '--color-muted': '82 82 82',
    '--color-muted-foreground': '163 163 163',
    '--color-destructive': '239 68 68',
    '--color-success': '34 197 94',
    '--color-border': '64 64 64',
  }),
};

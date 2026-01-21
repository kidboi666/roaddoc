import { vars } from 'nativewind';

export const Colors = {
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

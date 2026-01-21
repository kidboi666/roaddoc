import { Colors } from '@/shared/config';
import { useSettings } from './useSettings';

export function useThemeColor<T extends keyof typeof Colors.light>(
  colorName: T
): string {
  const { effectiveColorScheme } = useSettings();
  return Colors[effectiveColorScheme][colorName];
}

export function useColors() {
  const { effectiveColorScheme } = useSettings();
  return Colors[effectiveColorScheme];
}

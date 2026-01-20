import { useColorScheme } from 'react-native';
import { Colors } from '@/shared/config';

export function useThemeColor<T extends keyof typeof Colors.light>(
  colorName: T
): string {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme][colorName];
}

export function useColors() {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}

import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface GluestackUIProviderProps extends ViewProps {
  mode?: 'light' | 'dark' | 'system';
  children: React.ReactNode;
}

export function GluestackUIProvider({
  mode = 'system',
  children,
  ...props
}: GluestackUIProviderProps) {
  const colorScheme = useColorScheme();
  const resolvedMode = mode === 'system' ? colorScheme : mode;

  return (
    <View
      className={resolvedMode === 'dark' ? 'dark' : ''}
      style={{ flex: 1 }}
      {...props}
    >
      {children}
    </View>
  );
}

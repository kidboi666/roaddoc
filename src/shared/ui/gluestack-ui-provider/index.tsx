import { View, ViewProps } from 'react-native';
import { themeVars } from '@/shared/config';

interface GluestackUIProviderProps extends ViewProps {
  mode?: 'light' | 'dark';
  children: React.ReactNode;
}

export function GluestackUIProvider({
  mode = 'light',
  children,
  ...props
}: GluestackUIProviderProps) {
  return (
    <View
      style={[{ flex: 1 }, themeVars[mode]]}
      {...props}
    >
      {children}
    </View>
  );
}

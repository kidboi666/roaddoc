import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '설정',
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
            },
            headerTintColor: colorScheme === 'dark' ? '#f5f5f5' : '#1a1a1a',
          }}
        />
      </Stack>
    </>
  );
}

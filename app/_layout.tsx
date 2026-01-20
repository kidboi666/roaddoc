import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { useSettings } from '@/shared/hooks';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const needsOnboarding = !settings.onboardingCompleted || !settings.disclaimerAccepted;

    if (needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!needsOnboarding && inOnboarding) {
      router.replace('/');
    }
  }, [isLoading, settings.onboardingCompleted, settings.disclaimerAccepted, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
        }}
      >
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#333'} />
      </View>
    );
  }

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

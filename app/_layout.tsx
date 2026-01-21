import "../global.css";
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { GluestackUIProvider } from '@/shared/ui';
import { useSettings, useAutoStart } from '@/shared/hooks';
import { APP_INFO } from '@/shared/config';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { settings, isLoading, isDark, effectiveColorScheme } = useSettings();
  const { setShouldAutoStartRecording } = useAutoStart();
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) return;

    const { path, queryParams } = Linking.parse(url);
    if (path === 'start-recording') {
      const autoParam = queryParams?.auto;
      const shouldAuto = autoParam !== 'false';
      if (shouldAuto) {
        setShouldAutoStartRecording(true);
      }
    }
  }, [url, setShouldAutoStartRecording]);

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
      <GluestackUIProvider mode={effectiveColorScheme}>
        <View className="flex-1 justify-center items-center bg-background">
          <Text className="text-4xl mb-4">🚗</Text>
          <Text className="text-xl font-semibold text-foreground mb-2">
            {APP_INFO.name}
          </Text>
          <ActivityIndicator
            size="small"
            color={isDark ? '#a3a3a3' : '#525252'}
            className="mt-4"
          />
        </View>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode={effectiveColorScheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? '#171717' : '#f5f5f5',
          },
          animation: 'fade',
          animationDuration: 200,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '설정',
            headerStyle: {
              backgroundColor: isDark ? '#262626' : '#ffffff',
            },
            headerTintColor: isDark ? '#f5f5f5' : '#171717',
            headerShadowVisible: false,
            animation: 'slide_from_bottom',
            animationDuration: 250,
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}

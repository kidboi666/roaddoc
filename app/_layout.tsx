import "../global.css";
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { X, Settings } from 'lucide-react-native';
import { GluestackUIProvider, Button, ButtonIcon } from '@/shared/ui';
import { useSettings, useAutoStart } from '@/shared/hooks';
import { APP_INFO, getColors } from '@/shared/config';
import { initializeApp } from '@/shared/config/setup';

initializeApp();

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

  const colors = getColors(isDark);

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
                color={colors.icon}
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
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.icon,
              contentStyle: {
                backgroundColor: colors.background,
              },
              animation: 'fade',
              animationDuration: 200,
            }}
        >
          <Stack.Screen
              name="index"
              options={{
                animation: 'fade',
                headerShown: true,
                headerTitle: '',
                headerShadowVisible: false,
                headerRight: ({ tintColor }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => router.push('/settings')}
                        className="px-2"
                    >
                      <ButtonIcon as={Settings} size={22} color={tintColor} />
                    </Button>
                ),
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
                title: '설정',
                headerShadowVisible: false,
                animation: 'slide_from_bottom',
                animationDuration: 250,
                headerLeft: () => null,
                headerRight: ({ tintColor }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => router.back()}
                        className="px-2"
                    >
                      <ButtonIcon as={X} size={24} color={tintColor} />
                    </Button>
                ),
              }}
          />
        </Stack>
      </GluestackUIProvider>
  );
}

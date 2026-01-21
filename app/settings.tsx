import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { APP_INFO, VOICE_CONFIG, type ThemeMode } from '@/shared/config';
import { useSettings } from '@/shared/hooks';
import {
  Card,
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/shared/ui';

const SILENCE_OPTIONS = VOICE_CONFIG.silenceTimeoutOptions.map((ms) => ({
  label: `${ms / 1000}초`,
  value: ms,
}));

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: '시스템 설정 따름', value: 'system' },
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const {
    settings,
    setTtsSpeed,
    setSilenceTimeout,
    setThemeMode,
    setOnboardingCompleted,
    setDisclaimerAccepted,
  } = useSettings();

  const [showSilencePicker, setShowSilencePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleResetOnboarding = () => {
    Alert.alert('온보딩 리셋', '온보딩을 다시 진행하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '리셋',
        style: 'destructive',
        onPress: async () => {
          await setOnboardingCompleted(false);
          await setDisclaimerAccepted(false);
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const currentSilenceLabel =
    SILENCE_OPTIONS.find((opt) => opt.value === settings.silenceTimeout)?.label || '1.5초';
  const currentThemeLabel =
    THEME_OPTIONS.find((opt) => opt.value === settings.themeMode)?.label || '시스템 설정 따름';

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="mt-8 mx-4">
        <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-3 ml-1 uppercase tracking-wider">
          음성 설정
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <View className="border-b border-neutral-100 dark:border-neutral-700 pb-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                  <Ionicons name="speedometer-outline" size={18} color={isDark ? '#93C5FD' : '#3B82F6'} />
                </View>
                <Text className="text-base text-neutral-900 dark:text-neutral-100">TTS 속도</Text>
              </View>
              <Text className="text-base font-medium text-blue-500">
                {settings.ttsSpeed.toFixed(1)}x
              </Text>
            </View>
            <Slider
              style={{ marginHorizontal: -4 }}
              minimumValue={VOICE_CONFIG.ttsSpeedMin}
              maximumValue={VOICE_CONFIG.ttsSpeedMax}
              step={0.1}
              value={settings.ttsSpeed}
              onSlidingComplete={setTtsSpeed}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor={isDark ? '#404040' : '#E5E5E5'}
              thumbTintColor="#3B82F6"
            />
            <View className="flex-row justify-between mt-1 px-1">
              <Text className="text-xs text-neutral-400 dark:text-neutral-500">느림</Text>
              <Text className="text-xs text-neutral-400 dark:text-neutral-500">빠름</Text>
            </View>
          </View>

          <Pressable
            className="flex-row justify-between items-center active:opacity-70"
            onPress={() => setShowSilencePicker(true)}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900 items-center justify-center mr-3">
                <Ionicons name="timer-outline" size={18} color={isDark ? '#FDBA74' : '#F97316'} />
              </View>
              <Text className="text-base text-neutral-900 dark:text-neutral-100">침묵 감지 시간</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-neutral-400 dark:text-neutral-500 mr-1">
                {currentSilenceLabel}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={isDark ? '#525252' : '#A3A3A3'} />
            </View>
          </Pressable>
        </Card>
      </View>

      <View className="mt-6 mx-4">
        <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-3 ml-1 uppercase tracking-wider">
          화면 설정
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <Pressable
            className="flex-row justify-between items-center active:opacity-70"
            onPress={() => setShowThemePicker(true)}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
                <Ionicons name="moon-outline" size={18} color={isDark ? '#C4B5FD' : '#8B5CF6'} />
              </View>
              <Text className="text-base text-neutral-900 dark:text-neutral-100">다크 모드</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-neutral-400 dark:text-neutral-500 mr-1">
                {currentThemeLabel}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={isDark ? '#525252' : '#A3A3A3'} />
            </View>
          </Pressable>
        </Card>
      </View>

      <View className="mt-6 mx-4">
        <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-3 ml-1 uppercase tracking-wider">
          앱 정보
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 items-center justify-center mr-3">
                <Ionicons name="information-outline" size={18} color={isDark ? '#A3A3A3' : '#525252'} />
              </View>
              <Text className="text-base text-neutral-900 dark:text-neutral-100">버전</Text>
            </View>
            <Text className="text-base text-neutral-400 dark:text-neutral-500">
              {APP_INFO.version}
            </Text>
          </View>
        </Card>
      </View>

      {__DEV__ && (
        <View className="mt-6 mx-4 mb-8">
          <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-3 ml-1 uppercase tracking-wider">
            개발용
          </Text>

          <Card variant="elevated" size="md">
            <Pressable
              className="flex-row items-center active:opacity-70"
              onPress={handleResetOnboarding}
            >
              <View className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900 items-center justify-center mr-3">
                <Ionicons name="refresh-outline" size={18} color={isDark ? '#FCA5A5' : '#EF4444'} />
              </View>
              <Text className="text-base text-red-500 dark:text-red-400">
                온보딩 리셋
              </Text>
            </Pressable>
          </Card>
        </View>
      )}

      <Actionsheet isOpen={showSilencePicker} onClose={() => setShowSilencePicker(false)}>
        <ActionsheetContent>
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 text-center py-4">
            침묵 감지 시간
          </Text>
          <View className="pb-8">
            {SILENCE_OPTIONS.map((option) => (
              <ActionsheetItem
                key={option.value}
                onPress={() => {
                  setSilenceTimeout(option.value);
                  setShowSilencePicker(false);
                }}
                className={settings.silenceTimeout === option.value ? 'bg-neutral-100 dark:bg-neutral-700 mx-4 rounded-xl' : 'mx-4 rounded-xl'}
              >
                <ActionsheetItemText
                  className={settings.silenceTimeout === option.value ? 'font-semibold text-blue-500' : ''}
                >
                  {option.label}
                </ActionsheetItemText>
                {settings.silenceTimeout === option.value && (
                  <Ionicons name="checkmark" size={22} color="#3B82F6" style={{ marginLeft: 'auto' }} />
                )}
              </ActionsheetItem>
            ))}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet isOpen={showThemePicker} onClose={() => setShowThemePicker(false)}>
        <ActionsheetContent>
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 text-center py-4">
            다크 모드
          </Text>
          <View className="pb-8">
            {THEME_OPTIONS.map((option) => (
              <ActionsheetItem
                key={option.value}
                onPress={() => {
                  setThemeMode(option.value as ThemeMode);
                  setShowThemePicker(false);
                }}
                className={settings.themeMode === option.value ? 'bg-neutral-100 dark:bg-neutral-700 mx-4 rounded-xl' : 'mx-4 rounded-xl'}
              >
                <ActionsheetItemText
                  className={settings.themeMode === option.value ? 'font-semibold text-blue-500' : ''}
                >
                  {option.label}
                </ActionsheetItemText>
                {settings.themeMode === option.value && (
                  <Ionicons name="checkmark" size={22} color="#3B82F6" style={{ marginLeft: 'auto' }} />
                )}
              </ActionsheetItem>
            ))}
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </ScrollView>
  );
}

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import {APP_INFO, VOICE_CONFIG, type ThemeMode, getColors, Colors} from '@/shared/config';
import { useSettings } from '@/shared/hooks';
import {
  Card,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/shared/ui';
import {
  openShortcutsApp,
  getShortcutSetupInstructions,
} from '@/shared/lib/shortcuts';

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
  const router = useRouter();

  const {
    settings,
    isDark,
    setTtsSpeed,
    setSilenceTimeout,
    setThemeMode,
    setOnboardingCompleted,
    setDisclaimerAccepted,
  } = useSettings();

  const colors = getColors(isDark);

  const [showSilencePicker, setShowSilencePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showVoiceAssistantGuide, setShowVoiceAssistantGuide] = useState(false);

  const handleVoiceAssistantSetup = async () => {
    if (Platform.OS === 'ios') {
      setShowVoiceAssistantGuide(true);
    } else {
      Alert.alert(
        'Google Assistant 설정',
        '다음과 같이 설정하세요:\n\n' +
          '1. Google Assistant 앱을 엽니다\n' +
          '2. "루틴" 메뉴로 이동합니다\n' +
          '3. 새 루틴을 추가하고 시작 조건에 "로드닥 실행해"를 입력합니다\n' +
          '4. 동작에 "로드닥 앱 열기"를 추가합니다',
        [{ text: '확인' }]
      );
    }
  };

  const handleOpenShortcutsApp = async () => {
    const opened = await openShortcutsApp();
    if (!opened) {
      Alert.alert('오류', '단축어 앱을 열 수 없습니다.');
    }
  };

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
    <ScrollView className="flex-1 bg-background">
      <View className="mt-8 mx-4">
        <Text className="text-xs font-semibold text-muted-foreground mb-3 ml-1 uppercase tracking-wider">
          음성 설정
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <View className="border-b border-border pb-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }}
                >
                  <Ionicons name="speedometer-outline" size={18} color={isDark ? '#93C5FD' : '#3B82F6'} />
                </View>
                <Text className="text-base text-foreground">TTS 속도</Text>
              </View>
              <Text className="text-base font-medium text-primary">
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
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={Colors.primary}
            />
            <View className="flex-row justify-between mt-1 px-1">
              <Text className="text-xs text-muted-foreground">느림</Text>
              <Text className="text-xs text-muted-foreground">빠름</Text>
            </View>
          </View>

          <Pressable
            className="flex-row justify-between items-center active:opacity-70"
            onPress={() => setShowSilencePicker(true)}
          >
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#7c2d12' : '#ffedd5' }}
              >
                <Ionicons name="timer-outline" size={18} color={isDark ? '#FDBA74' : '#F97316'} />
              </View>
              <Text className="text-base text-foreground">침묵 감지 시간</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-muted-foreground mr-1">
                {currentSilenceLabel}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Pressable>
        </Card>
      </View>

      <View className="mt-6 mx-4">
        <Text className="text-xs font-semibold text-muted-foreground mb-3 ml-1 uppercase tracking-wider">
          음성 비서 연동
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <Pressable
            className="flex-row justify-between items-center active:opacity-70"
            onPress={handleVoiceAssistantSetup}
          >
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#14532d' : '#dcfce7' }}
              >
                <Ionicons
                  name={Platform.OS === 'ios' ? 'mic-outline' : 'logo-google'}
                  size={18}
                  color={isDark ? '#86EFAC' : '#22C55E'}
                />
              </View>
              <View>
                <Text className="text-base text-foreground">
                  {Platform.OS === 'ios' ? 'Siri 단축어 설정' : 'Google Assistant 설정'}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  음성으로 앱 실행하기
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#525252' : '#A3A3A3'} />
          </Pressable>
        </Card>
      </View>

      <View className="mt-6 mx-4">
        <Text className="text-xs font-semibold text-muted-foreground mb-3 ml-1 uppercase tracking-wider">
          화면 설정
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <Pressable
            className="flex-row justify-between items-center active:opacity-70"
            onPress={() => setShowThemePicker(true)}
          >
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#581c87' : '#f3e8ff' }}
              >
                <Ionicons name="moon-outline" size={18} color={isDark ? '#C4B5FD' : '#8B5CF6'} />
              </View>
              <Text className="text-base text-foreground">다크 모드</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-base text-muted-foreground mr-1">
                {currentThemeLabel}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Pressable>
        </Card>
      </View>

      <View className="mt-6 mx-4">
        <Text className="text-xs font-semibold text-muted-foreground mb-3 ml-1 uppercase tracking-wider">
          앱 정보
        </Text>

        <Card variant="elevated" size="md" className="mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-secondary items-center justify-center mr-3">
                <Ionicons name="information-outline" size={18} color={colors.icon} />
              </View>
              <Text className="text-base text-foreground">버전</Text>
            </View>
            <Text className="text-base text-muted-foreground">
              {APP_INFO.version}
            </Text>
          </View>
        </Card>
      </View>

      {__DEV__ && (
        <View className="mt-6 mx-4 mb-8">
          <Text className="text-xs font-semibold text-muted-foreground mb-3 ml-1 uppercase tracking-wider">
            개발용
          </Text>

          <Card variant="elevated" size="md">
            <Pressable
              className="flex-row items-center active:opacity-70"
              onPress={handleResetOnboarding}
            >
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#7f1d1d' : '#fee2e2' }}
              >
                <Ionicons name="refresh-outline" size={18} color={isDark ? '#FCA5A5' : '#EF4444'} />
              </View>
              <Text className="text-base text-destructive">
                온보딩 리셋
              </Text>
            </Pressable>
          </Card>
        </View>
      )}

      <Actionsheet isOpen={showSilencePicker} onClose={() => setShowSilencePicker(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <Text className="text-lg font-bold text-foreground text-center py-4">
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
                className={settings.silenceTimeout === option.value ? 'bg-secondary mx-4 rounded-xl' : 'mx-4 rounded-xl'}
              >
                <ActionsheetItemText
                  className={settings.silenceTimeout === option.value ? 'font-semibold text-primary' : ''}
                >
                  {option.label}
                </ActionsheetItemText>
                {settings.silenceTimeout === option.value && (
                  <Ionicons name="checkmark" size={22} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </ActionsheetItem>
            ))}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet isOpen={showThemePicker} onClose={() => setShowThemePicker(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <Text className="text-lg font-bold text-foreground text-center py-4">
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
                className={settings.themeMode === option.value ? 'bg-secondary mx-4 rounded-xl' : 'mx-4 rounded-xl'}
              >
                <ActionsheetItemText
                  className={settings.themeMode === option.value ? 'font-semibold text-primary' : ''}
                >
                  {option.label}
                </ActionsheetItemText>
                {settings.themeMode === option.value && (
                  <Ionicons name="checkmark" size={22} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </ActionsheetItem>
            ))}
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet isOpen={showVoiceAssistantGuide} onClose={() => setShowVoiceAssistantGuide(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <Text className="text-lg font-bold text-foreground text-center py-4">
            Siri 단축어 설정 방법
          </Text>
          <View className="px-4 pb-4">
            {getShortcutSetupInstructions().map((instruction, index) => (
              <Text key={index} className="text-sm text-foreground py-1.5">
                {instruction}
              </Text>
            ))}
          </View>
          <View className="pb-8 px-4">
            <Pressable
              className="bg-primary py-3 px-6 rounded-xl items-center active:opacity-80"
              onPress={handleOpenShortcutsApp}
            >
              <Text className="text-white font-semibold">단축어 앱 열기</Text>
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </ScrollView>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { APP_INFO, VOICE_CONFIG, type ThemeMode } from '@/shared/config';
import { useSettings } from '@/shared/hooks';

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
  const styles = createStyles(isDark);

  const { settings, setTtsSpeed, setSilenceTimeout, setThemeMode } = useSettings();
  const [showSilencePicker, setShowSilencePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const currentSilenceLabel =
    SILENCE_OPTIONS.find((opt) => opt.value === settings.silenceTimeout)?.label || '1.5초';
  const currentThemeLabel =
    THEME_OPTIONS.find((opt) => opt.value === settings.themeMode)?.label || '시스템 설정 따름';

  return (
    <ScrollView style={styles.container}>
      {/* 음성 설정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>음성 설정</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>TTS 속도</Text>
            <Text style={styles.settingValue}>{settings.ttsSpeed.toFixed(1)}x</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={VOICE_CONFIG.ttsSpeedMin}
            maximumValue={VOICE_CONFIG.ttsSpeedMax}
            step={0.1}
            value={settings.ttsSpeed}
            onSlidingComplete={setTtsSpeed}
            minimumTrackTintColor={isDark ? '#a0a0a0' : '#333333'}
            maximumTrackTintColor={isDark ? '#333333' : '#e0e0e0'}
            thumbTintColor={isDark ? '#f5f5f5' : '#1a1a1a'}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>느림</Text>
            <Text style={styles.sliderLabel}>빠름</Text>
          </View>
        </View>

        <Pressable style={styles.settingCard} onPress={() => setShowSilencePicker(true)}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>침묵 감지 시간</Text>
            <Text style={styles.settingValueClickable}>{currentSilenceLabel} ▼</Text>
          </View>
        </Pressable>
      </View>

      {/* 화면 설정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>화면 설정</Text>

        <Pressable style={styles.settingCard} onPress={() => setShowThemePicker(true)}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>다크 모드</Text>
            <Text style={styles.settingValueClickable}>{currentThemeLabel} ▼</Text>
          </View>
        </Pressable>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>버전</Text>
            <Text style={styles.settingValue}>{APP_INFO.version}</Text>
          </View>
        </View>
      </View>

      {/* 침묵 감지 시간 선택 모달 */}
      <PickerModal
        visible={showSilencePicker}
        onClose={() => setShowSilencePicker(false)}
        title="침묵 감지 시간"
        options={SILENCE_OPTIONS}
        selectedValue={settings.silenceTimeout}
        onSelect={(value) => {
          setSilenceTimeout(value);
          setShowSilencePicker(false);
        }}
        isDark={isDark}
      />

      {/* 테마 선택 모달 */}
      <PickerModal
        visible={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        title="다크 모드"
        options={THEME_OPTIONS}
        selectedValue={settings.themeMode}
        onSelect={(value) => {
          setThemeMode(value as ThemeMode);
          setShowThemePicker(false);
        }}
        isDark={isDark}
      />
    </ScrollView>
  );
}

interface PickerModalProps<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
  isDark: boolean;
}

function PickerModal<T>({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  isDark,
}: PickerModalProps<T>) {
  const styles = createModalStyles(isDark);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {options.map((option) => (
            <Pressable
              key={String(option.value)}
              style={[
                styles.option,
                selectedValue === option.value && styles.optionSelected,
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {selectedValue === option.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
    },
    section: {
      marginTop: 24,
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#a0a0a0' : '#666666',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingCard: {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 8,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabel: {
      fontSize: 16,
      color: isDark ? '#f5f5f5' : '#1a1a1a',
    },
    settingValue: {
      fontSize: 16,
      color: isDark ? '#a0a0a0' : '#666666',
    },
    settingValueClickable: {
      fontSize: 16,
      color: isDark ? '#a0a0a0' : '#666666',
    },
    slider: {
      marginTop: 12,
      marginHorizontal: -8,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    sliderLabel: {
      fontSize: 12,
      color: isDark ? '#666666' : '#999999',
    },
  });

const createModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    content: {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 16,
      padding: 8,
      width: '100%',
      maxWidth: 320,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#f5f5f5' : '#1a1a1a',
      textAlign: 'center',
      paddingVertical: 12,
      marginBottom: 4,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    optionSelected: {
      backgroundColor: isDark ? '#333333' : '#f0f0f0',
    },
    optionText: {
      fontSize: 16,
      color: isDark ? '#f5f5f5' : '#1a1a1a',
    },
    optionTextSelected: {
      fontWeight: '600',
    },
    checkmark: {
      fontSize: 16,
      color: isDark ? '#4ade80' : '#22c55e',
      fontWeight: '600',
    },
  });

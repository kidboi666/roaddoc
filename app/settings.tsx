import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { APP_INFO, VOICE_CONFIG } from '@/shared/config';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      {/* 음성 설정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>음성 설정</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>TTS 속도</Text>
          <Text style={styles.settingValue}>{VOICE_CONFIG.ttsSpeed}x</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>침묵 감지 시간</Text>
          <Text style={styles.settingValue}>{VOICE_CONFIG.silenceTimeout / 1000}초</Text>
        </View>
      </View>

      {/* 화면 설정 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>화면 설정</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>다크 모드</Text>
          <Text style={styles.settingValue}>시스템 설정 따름</Text>
        </View>
      </View>

      {/* 앱 정보 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>버전</Text>
          <Text style={styles.settingValue}>{APP_INFO.version}</Text>
        </View>
      </View>
    </ScrollView>
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
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 2,
    },
    settingLabel: {
      fontSize: 16,
      color: isDark ? '#f5f5f5' : '#1a1a1a',
    },
    settingValue: {
      fontSize: 16,
      color: isDark ? '#a0a0a0' : '#666666',
    },
  });

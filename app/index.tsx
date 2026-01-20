import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_INFO } from '@/shared/config';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
        <Text style={styles.title}>{APP_INFO.name}</Text>
      </View>

      {/* 대화 영역 */}
      <View style={styles.conversationArea}>
        <Text style={styles.placeholder}>대화 내용이 여기에 표시됩니다</Text>
      </View>

      {/* 마이크 버튼 영역 */}
      <View style={styles.micArea}>
        <Pressable style={styles.micButton}>
          <Text style={styles.micIcon}>🎤</Text>
        </Pressable>
        <Text style={styles.hint}>탭해서 질문하세요</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      position: 'relative',
    },
    settingsButton: {
      position: 'absolute',
      left: 16,
      padding: 8,
    },
    settingsIcon: {
      fontSize: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#f5f5f5' : '#1a1a1a',
    },
    conversationArea: {
      flex: 1,
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholder: {
      color: isDark ? '#666666' : '#999999',
      fontSize: 14,
    },
    micArea: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    micButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#6b7280' : '#9e9e9e',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    micIcon: {
      fontSize: 36,
    },
    hint: {
      color: isDark ? '#a0a0a0' : '#666666',
      fontSize: 14,
    },
  });

import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_INFO } from '@/shared/config';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  const handleStart = () => {
    // TODO: 마이크 권한 요청 및 면책 조항 표시
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🚗</Text>
        <Text style={styles.title}>{APP_INFO.name}</Text>
        <Text style={styles.slogan}>{APP_INFO.slogan}</Text>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            운전 중 궁금한 도로교통법{'\n'}
            음성으로 물어보세요
          </Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>시작하기</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      paddingHorizontal: 24,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? '#f5f5f5' : '#1a1a1a',
      marginBottom: 8,
    },
    slogan: {
      fontSize: 18,
      color: isDark ? '#a0a0a0' : '#666666',
      marginBottom: 48,
    },
    description: {
      alignItems: 'center',
    },
    descriptionText: {
      fontSize: 16,
      color: isDark ? '#a0a0a0' : '#666666',
      textAlign: 'center',
      lineHeight: 24,
    },
    button: {
      backgroundColor: isDark ? '#333333' : '#1a1a1a',
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 32,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

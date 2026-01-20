import { StyleSheet, Pressable, View, Text, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { APP_INFO, Colors } from '@/shared/config';
import { useVoiceAssistant } from '@/features/voice-assistant/model/useVoiceAssistant';
import { VoiceButton } from '@/features/voice-assistant/ui/VoiceButton';
import { StatusDisplay } from '@/features/voice-assistant/ui/StatusDisplay';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const {
    state,
    currentQuestion,
    currentAnswer,
    error,
    startListening,
    stopListening,
    cancel,
  } = useVoiceAssistant();

  // 버튼 탭 핸들러
  const handlePress = () => {
    if (state === 'idle') {
      startListening();
    } else if (state === 'recording') {
      stopListening();
    } else if (state === 'speaking') {
      cancel();
    }
  };

  // 버튼 롱프레스 핸들러 (취소)
  const handleLongPress = () => {
    if (state !== 'idle') {
      cancel();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.text}
          />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          {APP_INFO.name}
        </Text>
      </View>

      {/* 대화 영역 */}
      <View style={[styles.conversationArea, { backgroundColor: colors.card }]}>
        <StatusDisplay
          state={state}
          question={currentQuestion}
          answer={currentAnswer}
          error={error}
        />
      </View>

      {/* 마이크 버튼 영역 */}
      <View style={styles.micArea}>
        <VoiceButton
          state={state}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {state === 'idle'
            ? '탭해서 질문하세요'
            : state === 'recording'
            ? '다시 탭하면 중지'
            : state === 'speaking'
            ? '탭해서 중지'
            : '처리 중...'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  conversationArea: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
  },
  micArea: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 32,
  },
  hint: {
    fontSize: 14,
    marginTop: 8,
  },
});

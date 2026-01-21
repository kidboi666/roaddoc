import { Pressable, View, Text, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { APP_INFO } from '@/shared/config';
import { useVoiceAssistant } from '@/features/voice-assistant/model/useVoiceAssistant';
import { VoiceButton } from '@/features/voice-assistant/ui/VoiceButton';
import { StatusDisplay } from '@/features/voice-assistant/ui/StatusDisplay';
import { Card } from '@/shared/ui';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    state,
    currentQuestion,
    currentAnswer,
    error,
    startListening,
    stopListening,
    cancel,
  } = useVoiceAssistant();

  const handlePress = () => {
    if (state === 'idle') {
      startListening();
    } else if (state === 'recording') {
      stopListening();
    } else if (state === 'speaking') {
      cancel();
    }
  };

  const handleLongPress = () => {
    if (state !== 'idle') {
      cancel();
    }
  };

  const getHintText = () => {
    switch (state) {
      case 'recording':
        return '다시 탭하면 중지';
      case 'speaking':
        return '탭해서 중지';
      case 'processing':
        return '';
      default:
        return '탭해서 질문하세요';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {APP_INFO.name}
        </Text>
        <Pressable
          onPress={() => router.push('/settings')}
          className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 active:opacity-70"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={isDark ? '#a3a3a3' : '#525252'}
          />
        </Pressable>
      </View>

      <Card
        variant="elevated"
        size="lg"
        className="flex-1 mx-4 my-3"
      >
        <StatusDisplay
          state={state}
          question={currentQuestion}
          answer={currentAnswer}
          error={error}
        />
      </Card>

      <View className="items-center pt-4 pb-6">
        <VoiceButton
          state={state}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
        <Text className="text-sm text-neutral-400 dark:text-neutral-500 mt-3 h-5">
          {getHintText()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

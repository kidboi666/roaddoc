import { Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/shared/hooks';
import { useVoiceAssistant } from '@/features/voice-assistant/model/useVoiceAssistant';
import { VoiceButton } from '@/features/voice-assistant/ui/VoiceButton';
import { StatusDisplay } from '@/features/voice-assistant/ui/StatusDisplay';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useSettings();

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-end px-5 py-3">
        <Pressable
          onPress={() => router.push('/settings')}
          className="w-10 h-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={isDark ? '#a3a3a3' : '#525252'}
          />
        </Pressable>
      </View>

      <View className="flex-1 px-5 py-3">
        <StatusDisplay
          state={state}
          question={currentQuestion}
          answer={currentAnswer}
          error={error}
        />
      </View>

      <View className="items-center pt-4 pb-6">
        <VoiceButton
          state={state}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
        <Text className="text-sm text-muted-foreground mt-3 h-5">
          {getHintText()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

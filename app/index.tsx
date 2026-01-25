import {useEffect, useRef, useState} from 'react';
import { View, Text, Keyboard} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useSettings, useAutoStart } from '@/shared/hooks';
import { useVoiceAssistant } from '@/features/voice-assistant/model/useVoiceAssistant';
import { VoiceButton } from '@/features/voice-assistant/ui/VoiceButton';
import { StatusDisplay } from '@/features/voice-assistant/ui/StatusDisplay';
import {getColors, VOICE_CONFIG} from '@/shared/config';
import { BannerAd } from '@/shared/ui';
import {Input, InputIcon} from "@/shared/ui/input";

export default function HomeScreen() {
  const { isDark, settings } = useSettings();
  const colors = getColors(isDark);
  const { shouldAutoStartRecording, clearAutoStart } = useAutoStart();
  const autoStartHandledRef = useRef(false);

  const {
    state,
    error,
    startListening,
    stopListening,
    cancel,
      askQuestion
  } = useVoiceAssistant();
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    if (shouldAutoStartRecording && state === 'idle' && !autoStartHandledRef.current) {
      autoStartHandledRef.current = true;
      clearAutoStart();

      Speech.speak('네, 질문하세요', {
        language: VOICE_CONFIG.language,
        rate: settings.ttsSpeed,
        onDone: () => {
          startListening();
        },
        onError: () => {
          startListening();
        },
      });
    }
  }, [shouldAutoStartRecording, state, clearAutoStart, startListening, settings.ttsSpeed]);

  useEffect(() => {
    if (!shouldAutoStartRecording) {
      autoStartHandledRef.current = false;
    }
  }, [shouldAutoStartRecording]);

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

  const handleSendText = () => {
    if (!textInput.trim() || state !== 'idle') return;
    Keyboard.dismiss();
    askQuestion(textInput.trim());
    setTextInput('');
  };

  return (
      <View className="flex-1 bg-background">
        <View className="flex-1">
          <View className="flex-1 px-5 py-3">
            <StatusDisplay
                state={state}
                error={error}
                isDark={isDark}
            />
          </View>

          <View className="items-center pt-4 pb-2">
            <VoiceButton
                state={state}
                isDark={isDark}
                onPress={handlePress}
                onLongPress={handleLongPress}
            />
            <Text className="text-sm text-muted-foreground mt-3 h-5">
              {getHintText()}
            </Text>
          </View>

          <View className="px-5 pb-4">
            <Input
                variant="filled"
                placeholder="텍스트로 질문하기..."
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={handleSendText}
                returnKeyType="send"
                isDisabled={state !== 'idle'}
                rightElement={
                  <InputIcon onPress={handleSendText}>
                    <Ionicons
                        name="send"
                        size={20}
                        color={textInput.trim() && state === 'idle' ? colors.foreground : colors.muted}
                    />
                  </InputIcon>
                }
            />
          </View>
        </View>

        <BannerAd />
      </View>
  );
}

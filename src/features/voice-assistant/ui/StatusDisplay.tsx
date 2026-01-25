import {useEffect, useRef, memo,} from 'react';
import {View, Text, ScrollView, Animated} from 'react-native';
import {useVoiceMessages, type Message} from '../model/voiceStore';
import {getChatBubbleColors, getErrorColors} from "@/shared/config";

interface StatusDisplayProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  error: string | null;
  isDark: boolean;
}

function StatusDisplayComponent({state, error, isDark}: StatusDisplayProps) {
  const messages = useVoiceMessages();
  const chatColors = getChatBubbleColors(isDark);
  const errorColors = getErrorColors(isDark);
  const scrollViewRef = useRef<ScrollView>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (error) {
      errorOpacity.setValue(0);
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error, errorOpacity]);

  useEffect(() => {
    if (state === 'processing') {
      const blinkAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(dotsOpacity, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dotsOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    } else {
      dotsOpacity.setValue(1);
    }
  }, [state, dotsOpacity]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages.length]);

  const getStatusMessage = () => {
    switch (state) {
      case 'recording':
        return '듣고 있습니다...';
      case 'processing':
        return '생각 중...';
      case 'speaking':
        return '답변 중...';
      default:
        return messages.length === 0 ? '버튼을 눌러 질문하세요' : '';
    }
  };

  const statusMessage = getStatusMessage();

  const renderMessage = (message: Message) => {
    if (message.type === 'question') {
      return (
          <View
              key={message.id}
              style={{backgroundColor: chatColors.question}}
              className="rounded-2xl p-4 self-end max-w-[85%]"
          >
            <Text className="text-base leading-6 text-foreground">
              {message.content}
            </Text>
          </View>
      );
    }

    return (
        <View
            key={message.id}
            style={{
              backgroundColor: chatColors.answer,
              borderColor: chatColors.answerBorder,
            }}
            className="rounded-2xl p-4 border self-start max-w-[85%]"
        >
          <Text className="text-base leading-7 text-foreground">
            {message.content}
          </Text>
        </View>
    );
  };

  return (
      <View className="flex-1 w-full">
        {statusMessage !== '' && (
            <Animated.Text
                style={{opacity: state === 'processing' ? dotsOpacity : 1}}
                className="text-base font-medium text-center mb-4 text-muted-foreground"
            >
              {statusMessage}
            </Animated.Text>
        )}

        {error && (
            <Animated.View
                style={[
                  {opacity: errorOpacity},
                  {
                    backgroundColor: errorColors.background,
                    borderColor: errorColors.border,
                  },
                ]}
                className="rounded-2xl p-4 border"
            >
              <Text
                  style={{color: errorColors.text}}
                  className="text-sm text-center leading-5"
              >
                {error}
              </Text>
            </Animated.View>
        )}

        {messages.length > 0 && !error && (
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerClassName="gap-3 pb-4"
                showsVerticalScrollIndicator={false}
            >
              {messages.map(renderMessage)}
            </ScrollView>
        )}
      </View>
  );
}

export const StatusDisplay = memo(StatusDisplayComponent);

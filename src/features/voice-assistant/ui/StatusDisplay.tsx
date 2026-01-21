import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Easing } from 'react-native';

interface StatusDisplayProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  question: string | null;
  answer: string | null;
  error: string | null;
}

export function StatusDisplay({ state, question, answer, error }: StatusDisplayProps) {
  const questionOpacity = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (question) {
      questionOpacity.setValue(0);
      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [question, questionOpacity]);

  useEffect(() => {
    if (answer) {
      answerOpacity.setValue(0);
      Animated.timing(answerOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [answer, answerOpacity]);

  useEffect(() => {
    if (error) {
      errorOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, errorOpacity]);

  useEffect(() => {
    if (state === 'processing') {
      const animation = Animated.loop(
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
      animation.start();
      return () => animation.stop();
    } else {
      dotsOpacity.setValue(1);
    }
  }, [state, dotsOpacity]);

  const getStatusMessage = () => {
    switch (state) {
      case 'recording':
        return '듣고 있습니다...';
      case 'processing':
        return '답변을 준비하고 있습니다';
      case 'speaking':
        return '답변 중...';
      default:
        return '버튼을 눌러 질문하세요';
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <View className="flex-1 w-full">
      <Animated.Text
        style={{ opacity: state === 'processing' ? dotsOpacity : 1 }}
        className="text-base font-medium text-center mb-4 text-neutral-500 dark:text-neutral-400"
      >
        {statusMessage}
      </Animated.Text>

      {error && (
        <Animated.View
          style={{ opacity: errorOpacity }}
          className="rounded-2xl p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        >
          <Text className="text-sm text-red-600 dark:text-red-400 text-center leading-5">
            {error}
          </Text>
        </Animated.View>
      )}

      {(question || answer) && !error && (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 pb-4"
          showsVerticalScrollIndicator={false}
        >
          {question && (
            <Animated.View
              style={{ opacity: questionOpacity }}
              className="rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-700/50"
            >
              <Text className="text-xs font-semibold mb-2 uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                질문
              </Text>
              <Text className="text-base leading-6 text-neutral-800 dark:text-neutral-200">
                {question}
              </Text>
            </Animated.View>
          )}

          {answer && (
            <Animated.View
              style={{ opacity: answerOpacity }}
              className="rounded-2xl p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900"
            >
              <Text className="text-xs font-semibold mb-2 uppercase tracking-wider text-blue-500 dark:text-blue-400">
                답변
              </Text>
              <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200">
                {answer}
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

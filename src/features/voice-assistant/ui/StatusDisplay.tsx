import React from 'react';
import { StyleSheet, View, Text, useColorScheme, ScrollView } from 'react-native';
import { COLORS } from '@/shared/config';

interface StatusDisplayProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  question: string | null;
  answer: string | null;
  error: string | null;
}

export function StatusDisplay({ state, question, answer, error }: StatusDisplayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 상태별 메시지
  const getStatusMessage = () => {
    switch (state) {
      case 'recording':
        return '듣고 있습니다...';
      case 'processing':
        return '처리 중...';
      case 'speaking':
        return '답변 중...';
      default:
        return '버튼을 눌러 질문하세요';
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <View style={styles.container}>
      {/* 상태 메시지 */}
      <Text
        style={[
          styles.statusText,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        {statusMessage}
      </Text>

      {/* 에러 메시지 */}
      {error && (
        <View style={[styles.messageBox, styles.errorBox]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 대화 내용 */}
      {(question || answer) && !error && (
        <ScrollView
          style={styles.conversationContainer}
          contentContainerStyle={styles.conversationContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 질문 */}
          {question && (
            <View
              style={[
                styles.messageBox,
                styles.questionBox,
                { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard },
              ]}
            >
              <Text
                style={[
                  styles.messageLabel,
                  { color: isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary },
                ]}
              >
                질문
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: isDark ? COLORS.darkText : COLORS.lightText },
                ]}
              >
                {question}
              </Text>
            </View>
          )}

          {/* 답변 */}
          {answer && (
            <View
              style={[
                styles.messageBox,
                styles.answerBox,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Text style={[styles.messageLabel, { color: COLORS.primary }]}>
                답변
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: isDark ? COLORS.darkText : COLORS.lightText },
                ]}
              >
                {answer}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  conversationContainer: {
    flex: 1,
  },
  conversationContent: {
    gap: 12,
    paddingBottom: 20,
  },
  messageBox: {
    borderRadius: 12,
    padding: 16,
  },
  questionBox: {},
  answerBox: {},
  errorBox: {
    backgroundColor: COLORS.error + '15',
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
});

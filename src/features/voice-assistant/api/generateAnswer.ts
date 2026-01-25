import { getOpenAIClient } from '@/shared/api/openai';
import { parseApiError } from '@/shared/api/errorHandler';
import { getVoiceConfig } from '../config';

interface GenerateAnswerOptions {
  question: string;
  previousContext?: {
    question: string;
    answer: string;
  } | null;
  detailed?: boolean;
}

interface GenerateAnswerResult {
  answer: string;
  success: boolean;
  error?: string;
}

export async function generateAnswer(options: GenerateAnswerOptions): Promise<GenerateAnswerResult> {
  const { question, previousContext, detailed = false } = options;
  const config = getVoiceConfig();
  const openai = getOpenAIClient();

  let retryCount = 0;
  let lastError: string | undefined;

  while (retryCount < config.retryCount) {
    try {
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: config.systemPrompt },
      ];

      if (previousContext) {
        messages.push(
          { role: 'user', content: previousContext.question },
          { role: 'assistant', content: previousContext.answer }
        );
      }

      messages.push({ role: 'user', content: question });

      const response = await openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: detailed ? config.maxTokensDetailed : config.maxTokens,
      });

      const answer = response.choices[0]?.message?.content;

      if (!answer || answer.trim().length === 0) {
        return {
          answer: '',
          success: false,
          error: '답변을 생성할 수 없습니다. 다시 질문해 주세요.',
        };
      }

      if (__DEV__) {
        console.log('[GenerateAnswer] Success');
      }

      return {
        answer: answer.trim(),
        success: true,
      };
    } catch (error) {
      retryCount++;
      const errorInfo = parseApiError(error);

      if (__DEV__) {
        console.error(`[GenerateAnswer] Attempt ${retryCount} failed:`, error);
      }

      if (!errorInfo.shouldRetry) {
        return {
          answer: '',
          success: false,
          error: errorInfo.userMessage,
        };
      }

      lastError = errorInfo.userMessage;

      if (retryCount >= config.retryCount) {
        return {
          answer: '',
          success: false,
          error: lastError,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return {
    answer: '',
    success: false,
    error: '답변 생성에 실패했습니다. 다시 시도해 주세요.',
  };
}

export function isFollowUpCommand(text: string): boolean {
  const followUpKeywords = [
    '자세히',
    '자세하게',
    '더 알려',
    '다시 말해',
    '다시 설명',
    '반복',
  ];

  const lowerText = text.toLowerCase();
  return followUpKeywords.some((keyword) => lowerText.includes(keyword));
}

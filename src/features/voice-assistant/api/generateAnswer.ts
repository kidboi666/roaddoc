import { openai } from '@/shared/api/openai';
import { SYSTEM_PROMPT, OPENAI_CONFIG } from '@/shared/config';

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

  let retryCount = 0;

  while (retryCount < OPENAI_CONFIG.retryCount) {
    try {
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      if (previousContext) {
        messages.push(
          { role: 'user', content: previousContext.question },
          { role: 'assistant', content: previousContext.answer }
        );
      }

      messages.push({ role: 'user', content: question });

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages,
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: detailed ? OPENAI_CONFIG.maxTokensDetailed : OPENAI_CONFIG.maxTokens,
      });

      const answer = response.choices[0]?.message?.content;

      if (!answer || answer.trim().length === 0) {
        return {
          answer: '',
          success: false,
          error: '답변을 생성할 수 없습니다.',
        };
      }

      return {
        answer: answer.trim(),
        success: true,
      };
    } catch (error) {
      retryCount++;
      console.error(`Answer generation attempt ${retryCount} failed:`, error);

      if (retryCount >= OPENAI_CONFIG.retryCount) {
        return {
          answer: '',
          success: false,
          error: '잠시 후 다시 시도해 주세요.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return {
    answer: '',
    success: false,
    error: '답변 생성에 실패했습니다.',
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

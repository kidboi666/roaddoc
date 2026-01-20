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

/**
 * GPT-4o-mini를 사용하여 답변 생성
 */
export async function generateAnswer(options: GenerateAnswerOptions): Promise<GenerateAnswerResult> {
  const { question, previousContext, detailed = false } = options;

  let retryCount = 0;

  while (retryCount < OPENAI_CONFIG.retryCount) {
    try {
      // 메시지 구성
      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      // 이전 대화 컨텍스트 추가 (후속 질문 처리용)
      if (previousContext) {
        messages.push(
          { role: 'user', content: previousContext.question },
          { role: 'assistant', content: previousContext.answer }
        );
      }

      // 현재 질문 추가
      messages.push({ role: 'user', content: question });

      // API 호출
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

      // 재시도 전 대기
      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
    }
  }

  return {
    answer: '',
    success: false,
    error: '답변 생성에 실패했습니다.',
  };
}

/**
 * 후속 명령어인지 확인 (더 자세히, 다시 말해 등)
 * GPT가 자연어로 처리하므로 기본적인 키워드만 체크
 */
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

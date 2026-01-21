export interface ApiErrorInfo {
  userMessage: string;
  shouldRetry: boolean;
}

export function parseApiError(error: unknown): ApiErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('insufficient_quota') || message.includes('429')) {
      return {
        userMessage: 'API 사용량이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
        shouldRetry: false,
      };
    }

    if (message.includes('401') || message.includes('invalid_api_key')) {
      return {
        userMessage: '인증에 실패했습니다. 앱을 다시 시작해 주세요.',
        shouldRetry: false,
      };
    }

    if (message.includes('rate_limit') || message.includes('too many requests')) {
      return {
        userMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        shouldRetry: true,
      };
    }

    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return {
        userMessage: '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
        shouldRetry: true,
      };
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        userMessage: '네트워크 연결을 확인해 주세요.',
        shouldRetry: true,
      };
    }

    if (message.includes('timeout')) {
      return {
        userMessage: '응답 시간이 초과되었습니다. 다시 시도해 주세요.',
        shouldRetry: true,
      };
    }
  }

  return {
    userMessage: '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
    shouldRetry: true,
  };
}

export function parseHttpStatus(status: number, body?: string): ApiErrorInfo {
  if (body?.includes('insufficient_quota')) {
    return {
      userMessage: 'API 사용량이 초과되었습니다. 관리자에게 문의해 주세요.',
      shouldRetry: false,
    };
  }

  switch (status) {
    case 400:
      return {
        userMessage: '잘못된 요청입니다. 다시 시도해 주세요.',
        shouldRetry: false,
      };
    case 401:
      return {
        userMessage: '인증에 실패했습니다. 앱을 다시 시작해 주세요.',
        shouldRetry: false,
      };
    case 429:
      return {
        userMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        shouldRetry: true,
      };
    case 500:
    case 502:
    case 503:
      return {
        userMessage: '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
        shouldRetry: true,
      };
    default:
      return {
        userMessage: '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
        shouldRetry: true,
      };
  }
}

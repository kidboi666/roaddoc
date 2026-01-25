import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function createOpenAIClient(apiKey: string): OpenAI {
  openaiInstance = new OpenAI({ apiKey });
  return openaiInstance;
}

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_OPENAI_API_KEY is not set');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export { OpenAI };

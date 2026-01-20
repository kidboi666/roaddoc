/// <reference types="expo-router/types" />

// 환경 변수 타입
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENAI_API_KEY: string;
    }
  }
}

export {};

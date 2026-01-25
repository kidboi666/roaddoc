import AsyncStorage from '@react-native-async-storage/async-storage';
import { USAGE_LIMIT_CONFIG } from '@/shared/config/constants';

export interface UsageLimitConfig {
  freeLimit: number;
  premiumLimit: number;
  storageKeyPrefix: string;
}

export interface UsageLimitState {
  count: number;
  date: string;
  isPremium: boolean;
}

export interface UsageLimitResult {
  canUse: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function checkAndResetIfNewDay(state: UsageLimitState): UsageLimitState {
  const today = getTodayDateString();
  if (state.date !== today) {
    return {
      ...state,
      count: 0,
      date: today,
    };
  }
  return state;
}

export function canUseApi(
  state: UsageLimitState,
  config: UsageLimitConfig = USAGE_LIMIT_CONFIG
): UsageLimitResult {
  const checkedState = checkAndResetIfNewDay(state);
  const limit = checkedState.isPremium ? config.premiumLimit : config.freeLimit;
  const isUnlimited = limit === -1;
  const canUse = isUnlimited || checkedState.count < limit;
  const remaining = isUnlimited ? -1 : Math.max(0, limit - checkedState.count);

  return {
    canUse,
    remaining,
    limit,
    isPremium: checkedState.isPremium,
  };
}

export function incrementUsage(state: UsageLimitState): UsageLimitState {
  const checkedState = checkAndResetIfNewDay(state);
  return {
    ...checkedState,
    count: checkedState.count + 1,
  };
}

export async function loadUsageState(
  config: UsageLimitConfig = USAGE_LIMIT_CONFIG
): Promise<UsageLimitState> {
  const key = `${config.storageKeyPrefix}/state`;
  const stored = await AsyncStorage.getItem(key);

  if (stored) {
    const parsed = JSON.parse(stored) as UsageLimitState;
    return checkAndResetIfNewDay(parsed);
  }

  return {
    count: 0,
    date: getTodayDateString(),
    isPremium: false,
  };
}

export async function saveUsageState(
  state: UsageLimitState,
  config: UsageLimitConfig = USAGE_LIMIT_CONFIG
): Promise<void> {
  const key = `${config.storageKeyPrefix}/state`;
  await AsyncStorage.setItem(key, JSON.stringify(state));
}

export function getUsageLimitError(result: UsageLimitResult): string {
  return `오늘의 무료 사용 횟수(${result.limit}회)를 모두 사용했습니다. 내일 다시 이용해 주세요.`;
}

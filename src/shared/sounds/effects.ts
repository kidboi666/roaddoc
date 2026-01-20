import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

/**
 * 효과음 타입
 */
export type SoundEffect = 'start' | 'end' | 'processing' | 'error';

/**
 * 효과음 재생 훅
 * MVP에서는 햅틱 피드백으로 대체 (실제 효과음 파일은 추후 추가)
 */
export function useSoundEffects() {
  const playSound = useCallback(async (effect: SoundEffect) => {
    try {
      switch (effect) {
        case 'start':
          // 녹음 시작: 가벼운 햅틱
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'end':
          // 녹음 종료: 중간 햅틱
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'processing':
          // 처리 중: 가벼운 햅틱
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'error':
          // 에러: 경고 햅틱
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch {
      // 햅틱이 지원되지 않는 기기에서는 무시
      console.log('Haptic feedback not available');
    }
  }, []);

  return { playSound };
}

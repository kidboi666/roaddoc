import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export type SoundEffect = 'start' | 'end' | 'processing' | 'error';

export function useSoundEffects() {
  const playSound = useCallback(async (effect: SoundEffect) => {
    try {
      switch (effect) {
        case 'start':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'end':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'processing':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch {
      console.log('Haptic feedback not available');
    }
  }, []);

  return { playSound };
}

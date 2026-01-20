import * as Haptics from 'expo-haptics';

export type HapticType = 'start' | 'end' | 'processing' | 'error';

export function useHaptics() {
  const play = async (type: HapticType) => {
    try {
      switch (type) {
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
  };

  return { play };
}

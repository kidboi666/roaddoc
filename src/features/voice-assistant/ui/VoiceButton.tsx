import { useRef, useEffect } from 'react';
import { Pressable, View, Animated, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/shared/hooks';
import { Colors } from '@/shared/config';

interface VoiceButtonProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

const BUTTON_COLORS = {
  idle: {
    light: '#FFFFFF',
    dark: Colors.primary,
  },
  recording: Colors.error,
  processing: '#6B7280',
  speaking: Colors.success,
};

const ICON_COLORS = {
  idle: {
    light: Colors.primary,
    dark: '#FFFFFF',
  },
  default: '#FFFFFF',
};

export function VoiceButton({
  state,
  onPress,
  onLongPress,
  disabled = false,
}: VoiceButtonProps) {
  const { isDark } = useSettings();
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'recording') {
      const createPulse = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );

      const pulse1 = createPulse(pulseAnim1, 0);
      const pulse2 = createPulse(pulseAnim2, 750);

      pulse1.start();
      pulse2.start();

      return () => {
        pulse1.stop();
        pulse2.stop();
        pulseAnim1.setValue(0);
        pulseAnim2.setValue(0);
      };
    }
  }, [state, pulseAnim1, pulseAnim2]);

  useEffect(() => {
    if (state === 'processing') {
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotate.start();
      return () => {
        rotate.stop();
        rotateAnim.setValue(0);
      };
    }
  }, [state, rotateAnim]);

  useEffect(() => {
    if (state === 'speaking') {
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      wave.start();
      return () => {
        wave.stop();
        waveAnim.setValue(0);
      };
    }
  }, [state, waveAnim]);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: state === 'idle' ? 1 : 1.05,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [state, scaleAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const pulseOpacity1 = pulseAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const pulseScale2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const pulseOpacity2 = pulseAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const getIcon = (): 'mic' | 'stop' | 'sync' | 'volume-high' => {
    switch (state) {
      case 'recording':
        return 'stop';
      case 'processing':
        return 'sync';
      case 'speaking':
        return 'volume-high';
      default:
        return 'mic';
    }
  };

  const iconName = getIcon();
  const buttonColor =
    state === 'idle'
      ? BUTTON_COLORS.idle[isDark ? 'dark' : 'light']
      : BUTTON_COLORS[state];
  const iconColor =
    state === 'idle'
      ? ICON_COLORS.idle[isDark ? 'dark' : 'light']
      : ICON_COLORS.default;

  return (
    <View className="items-center justify-center w-44 h-44">
      {state === 'recording' && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: BUTTON_COLORS.recording,
                transform: [{ scale: pulseScale1 }],
                opacity: pulseOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: BUTTON_COLORS.recording,
                transform: [{ scale: pulseScale2 }],
                opacity: pulseOpacity2,
              },
            ]}
          />
        </>
      )}

      {state === 'speaking' && (
        <Animated.View
          style={[
            styles.speakingRing,
            {
              transform: [{ scale: waveScale }],
            },
          ]}
        />
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled || state === 'processing'}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: buttonColor },
            state === 'idle' && !isDark && styles.idleLightButton,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Animated.View
            style={
              state === 'processing' ? { transform: [{ rotate: spin }] } : undefined
            }
          >
            <Ionicons name={iconName} size={44} color={iconColor} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  speakingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  idleLightButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

import { useRef, useEffect, memo } from 'react';
import { Pressable, View, Animated, StyleSheet, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {Colors} from "@/shared/config";

interface VoiceButtonProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  isDark: boolean;
  onPress: () => void;
  onLongPress?: () => void;
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

function VoiceButtonComponent({ state, isDark, onPress, onLongPress }: VoiceButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulseAnim.stopAnimation();
    spinAnim.stopAnimation();
    waveAnim.stopAnimation();

    pulseAnim.setValue(1);
    spinAnim.setValue(0);
    waveAnim.setValue(0);

    if (state === 'recording') {
      const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
      );
      pulse.start();
    }

    if (state === 'processing') {
      const spin = Animated.loop(
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
      );
      spin.start();
    }

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
    }

    return () => {
      pulseAnim.stopAnimation();
      spinAnim.stopAnimation();
      waveAnim.stopAnimation();
    };
  }, [state, pulseAnim, spinAnim, waveAnim]);

  const getButtonColor = () => {
    if (state === 'idle') {
      return isDark ? BUTTON_COLORS.idle.dark : BUTTON_COLORS.idle.light;
    }
    return BUTTON_COLORS[state];
  };

  const getIconColor = () => {
    if (state === 'idle') {
      return isDark ? ICON_COLORS.idle.dark : ICON_COLORS.idle.light;
    }
    return ICON_COLORS.default;
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
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

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const getAnimatedStyle = () => {
    if (state === 'recording') {
      return { transform: [{ scale: pulseAnim }] };
    }
    if (state === 'processing') {
      return { transform: [{ rotate: spinRotation }] };
    }
    if (state === 'speaking') {
      return { transform: [{ scale: waveScale }] };
    }
    return {};
  };

  const renderRipple = () => {
    if (state !== 'recording') return null;

    return (
        <>
          <Animated.View
              style={[
                styles.ripple,
                {
                  backgroundColor: BUTTON_COLORS.recording,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.3, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 1.6],
                      }),
                    },
                  ],
                },
              ]}
          />
          <Animated.View
              style={[
                styles.ripple,
                {
                  backgroundColor: BUTTON_COLORS.recording,
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.2, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
          />
        </>
    );
  };

  return (
      <View style={styles.container}>
        {renderRipple()}
        <Animated.View style={getAnimatedStyle()}>
          <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              delayLongPress={500}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: getButtonColor() },
                state === 'idle' && !isDark && styles.idleLightButton,
                pressed && styles.buttonPressed,
              ]}
          >
            <Ionicons name={getIconName()} size={32} color={getIconColor()} />
          </Pressable>
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  idleLightButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  ripple: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
});

export const VoiceButton = memo(VoiceButtonComponent);

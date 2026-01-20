import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  Animated,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/shared/config';

interface VoiceButtonProps {
  state: 'idle' | 'recording' | 'processing' | 'speaking';
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  state,
  onPress,
  onLongPress,
  disabled = false,
}: VoiceButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 애니메이션 값
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 녹음 중 펄스 애니메이션
  useEffect(() => {
    if (state === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  // 처리 중 회전 애니메이션
  useEffect(() => {
    if (state === 'processing') {
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      rotate.start();
      return () => rotate.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [state, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 상태별 스타일
  const getButtonStyle = () => {
    switch (state) {
      case 'recording':
        return {
          backgroundColor: COLORS.error,
        };
      case 'processing':
        return {
          backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard,
        };
      case 'speaking':
        return {
          backgroundColor: COLORS.success,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
        };
    }
  };

  // 상태별 아이콘
  const getIcon = () => {
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

  const buttonStyle = getButtonStyle();
  const iconName = getIcon();

  return (
    <View style={styles.container}>
      {/* 배경 링 (녹음 중) */}
      {state === 'recording' && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: COLORS.error + '30',
            },
          ]}
        />
      )}

      {/* 메인 버튼 */}
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled || state === 'processing'}
        style={({ pressed }) => [
          styles.button,
          buttonStyle,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Animated.View
          style={
            state === 'processing' ? { transform: [{ rotate: spin }] } : undefined
          }
        >
          <Ionicons name={iconName} size={48} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

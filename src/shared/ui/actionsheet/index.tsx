'use client';
import { createContext, useContext, forwardRef, useEffect, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  ViewProps,
  TextProps,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface ActionsheetContextType {
  onClose?: () => void;
  isOpen: boolean;
  onAnimationComplete: () => void;
}

const ActionsheetContext = createContext<ActionsheetContextType>({
  isOpen: false,
  onAnimationComplete: () => {},
});

export interface ActionsheetProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function Actionsheet({ isOpen, onClose, children }: ActionsheetProps) {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
    }
  }, [isOpen]);

  const handleAnimationComplete = () => {
    if (!isOpen) {
      setModalVisible(false);
    }
  };

  return (
    <ActionsheetContext.Provider value={{ onClose, isOpen, onAnimationComplete: handleAnimationComplete }}>
      <RNModal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end">
          {children}
        </View>
      </RNModal>
    </ActionsheetContext.Provider>
  );
}

export interface ActionsheetBackdropProps extends ViewProps {}

export const ActionsheetBackdrop = forwardRef<View, ActionsheetBackdropProps>(
  ({ className, ...props }, ref) => {
    const { onClose, isOpen } = useContext(ActionsheetContext);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (isOpen) {
        opacity.value = withTiming(0.5, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      } else {
        opacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        });
      }
    }, [isOpen]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
          animatedStyle,
        ]}
      >
        <Pressable
          ref={ref as any}
          onPress={onClose}
          className={`flex-1 bg-black ${className}`}
          {...props}
        />
      </Animated.View>
    );
  }
);

ActionsheetBackdrop.displayName = 'ActionsheetBackdrop';

export interface ActionsheetContentProps extends ViewProps {}

export const ActionsheetContent = forwardRef<View, ActionsheetContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, onAnimationComplete } = useContext(ActionsheetContext);
    const { height: screenHeight } = useWindowDimensions();
    const translateY = useSharedValue(screenHeight);

    useEffect(() => {
      if (isOpen) {
        translateY.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        translateY.value = withTiming(
          screenHeight,
          {
            duration: 250,
            easing: Easing.in(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(onAnimationComplete)();
            }
          }
        );
      }
    }, [isOpen, screenHeight]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View
        ref={ref as any}
        style={animatedStyle}
        className={`bg-card rounded-t-3xl ${className}`}
        {...props}
      >
        <View className="w-10 h-1 bg-muted rounded-full self-center mt-3 mb-2" />
        {children}
      </Animated.View>
    );
  }
);

ActionsheetContent.displayName = 'ActionsheetContent';

export interface ActionsheetDragIndicatorWrapperProps extends ViewProps {}

export const ActionsheetDragIndicatorWrapper = forwardRef<View, ActionsheetDragIndicatorWrapperProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`items-center py-2 ${className}`}
        {...props}
      />
    );
  }
);

ActionsheetDragIndicatorWrapper.displayName = 'ActionsheetDragIndicatorWrapper';

export interface ActionsheetDragIndicatorProps extends ViewProps {}

export const ActionsheetDragIndicator = forwardRef<View, ActionsheetDragIndicatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`w-10 h-1 bg-muted rounded-full ${className}`}
        {...props}
      />
    );
  }
);

ActionsheetDragIndicator.displayName = 'ActionsheetDragIndicator';

export interface ActionsheetItemProps extends ViewProps {
  onPress?: () => void;
}

export const ActionsheetItem = forwardRef<View, ActionsheetItemProps>(
  ({ className, onPress, ...props }, ref) => {
    return (
      <Pressable
        ref={ref as any}
        onPress={onPress}
        className={`flex-row items-center py-4 px-6 active:opacity-70 ${className}`}
        {...props}
      />
    );
  }
);

ActionsheetItem.displayName = 'ActionsheetItem';

export interface ActionsheetItemTextProps extends TextProps {}

export const ActionsheetItemText = forwardRef<Text, ActionsheetItemTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={`text-base text-foreground ${className}`}
        {...props}
      />
    );
  }
);

ActionsheetItemText.displayName = 'ActionsheetItemText';

export interface ActionsheetScrollViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionsheetScrollView({ children, className }: ActionsheetScrollViewProps) {
  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  );
}

import { createContext, useContext, forwardRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  ViewProps,
  TextProps,
  ScrollView,
} from 'react-native';

interface ActionsheetContextType {
  onClose?: () => void;
}

const ActionsheetContext = createContext<ActionsheetContextType>({});

export interface ActionsheetProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function Actionsheet({ isOpen, onClose, children }: ActionsheetProps) {
  return (
    <ActionsheetContext.Provider value={{ onClose }}>
      <RNModal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={onClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {children}
          </Pressable>
        </Pressable>
      </RNModal>
    </ActionsheetContext.Provider>
  );
}

export interface ActionsheetBackdropProps extends ViewProps {}

export const ActionsheetBackdrop = forwardRef<View, ActionsheetBackdropProps>(
  ({ className, ...props }, ref) => {
    const { onClose } = useContext(ActionsheetContext);
    return (
      <Pressable
        ref={ref as any}
        onPress={onClose}
        className={`absolute inset-0 bg-black/60 ${className}`}
        {...props}
      />
    );
  }
);

ActionsheetBackdrop.displayName = 'ActionsheetBackdrop';

export interface ActionsheetContentProps extends ViewProps {}

export const ActionsheetContent = forwardRef<View, ActionsheetContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`bg-card rounded-t-3xl ${className}`}
        {...props}
      >
        <View className="w-10 h-1 bg-muted rounded-full self-center mt-3 mb-2" />
        {children}
      </View>
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

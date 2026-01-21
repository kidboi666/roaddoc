import { createContext, useContext, forwardRef } from 'react';
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  View,
  Text,
  Pressable,
  ViewProps,
  TextProps,
} from 'react-native';

interface ModalContextType {
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextType>({});

export interface ModalProps extends RNModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  ...props
}: ModalProps) {
  const sizeClasses = {
    xs: 'max-w-[280px]',
    sm: 'max-w-[320px]',
    md: 'max-w-[400px]',
    lg: 'max-w-[480px]',
    full: 'max-w-full mx-4',
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <RNModal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        {...props}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center p-6"
          onPress={closeOnOverlayClick ? onClose : undefined}
        >
          <Pressable
            className={`bg-card rounded-3xl w-full ${sizeClasses[size]}`}
            onPress={(e) => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </Pressable>
      </RNModal>
    </ModalContext.Provider>
  );
}

export interface ModalBackdropProps extends ViewProps {}

export const ModalBackdrop = forwardRef<View, ModalBackdropProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`absolute inset-0 bg-black/60 ${className}`}
        {...props}
      />
    );
  }
);

ModalBackdrop.displayName = 'ModalBackdrop';

export interface ModalContentProps extends ViewProps {}

export const ModalContent = forwardRef<View, ModalContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`p-6 ${className}`}
        {...props}
      />
    );
  }
);

ModalContent.displayName = 'ModalContent';

export interface ModalHeaderProps extends ViewProps {}

export const ModalHeader = forwardRef<View, ModalHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`mb-4 ${className}`}
        {...props}
      />
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export interface ModalBodyProps extends ViewProps {}

export const ModalBody = forwardRef<View, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`mb-6 ${className}`}
        {...props}
      />
    );
  }
);

ModalBody.displayName = 'ModalBody';

export interface ModalFooterProps extends ViewProps {}

export const ModalFooter = forwardRef<View, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`flex-row gap-3 ${className}`}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

export interface ModalCloseButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
}

export function ModalCloseButton({ onPress, children }: ModalCloseButtonProps) {
  const { onClose } = useContext(ModalContext);

  return (
    <Pressable
      onPress={onPress || onClose}
      className="absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-secondary"
    >
      {children || <Text className="text-muted-foreground text-lg">✕</Text>}
    </Pressable>
  );
}

export interface HeadingProps extends TextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Heading({ size = 'lg', className, ...props }: HeadingProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };

  return (
    <Text
      className={`font-bold text-foreground ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

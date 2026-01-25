import { TextInput, TextInputProps, View, Pressable } from 'react-native';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {Colors} from "@/shared/config";

const inputVariants = cva(
    'flex-row items-center rounded-xl border bg-background',
    {
      variants: {
        size: {
          sm: 'h-10 px-3',
          md: 'h-12 px-4',
          lg: 'h-14 px-5',
        },
        variant: {
          outline: 'border-border',
          filled: 'border-transparent bg-secondary',
        },
        isDisabled: {
          true: 'opacity-50',
          false: '',
        },
        isFocused: {
          true: 'border-primary',
          false: '',
        },
      },
      defaultVariants: {
        size: 'md',
        variant: 'outline',
        isDisabled: false,
        isFocused: false,
      },
    }
);

const inputFieldVariants = cva('flex-1 text-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface InputProps
    extends Omit<TextInputProps, 'editable'>,
        VariantProps<typeof inputVariants> {
  isDisabled?: boolean;
  isFocused?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
    (
        {
          size,
          variant,
          isDisabled,
          isFocused,
          leftElement,
          rightElement,
          className,
          placeholderTextColor,
          ...props
        },
        ref
    ) => {
      return (
          <View
              className={inputVariants({
                size,
                variant,
                isDisabled,
                isFocused,
                className,
              })}
          >
            {leftElement}
            <TextInput
                ref={ref}
                editable={!isDisabled}
                placeholderTextColor={placeholderTextColor ?? Colors.light.muted}
                className={inputFieldVariants({ size })}
                {...props}
            />
            {rightElement}
          </View>
      );
    }
);

Input.displayName = 'Input';

export interface InputIconProps {
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function InputIcon({ onPress, children, className }: InputIconProps) {
  if (onPress) {
    return (
        <Pressable
            onPress={onPress}
            className={`p-2 -m-2 active:opacity-70 ${className ?? ''}`}
        >
          {children}
        </Pressable>
    );
  }
  return <View className={className}>{children}</View>;
}

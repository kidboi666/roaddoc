import { forwardRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl active:opacity-80',
  {
    variants: {
      variant: {
        solid: 'bg-blue-500',
        outline: 'border-2 border-blue-500 bg-transparent',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        xs: 'h-8 px-3',
        sm: 'h-10 px-4',
        md: 'h-12 px-5',
        lg: 'h-14 px-6',
        xl: 'h-16 px-8',
      },
      action: {
        primary: '',
        secondary: '',
        positive: '',
        negative: '',
      },
    },
    compoundVariants: [
      { variant: 'solid', action: 'primary', className: 'bg-blue-500' },
      { variant: 'solid', action: 'secondary', className: 'bg-neutral-500' },
      { variant: 'solid', action: 'positive', className: 'bg-green-500' },
      { variant: 'solid', action: 'negative', className: 'bg-red-500' },
      { variant: 'outline', action: 'primary', className: 'border-blue-500' },
      { variant: 'outline', action: 'secondary', className: 'border-neutral-500' },
      { variant: 'outline', action: 'positive', className: 'border-green-500' },
      { variant: 'outline', action: 'negative', className: 'border-red-500' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      action: 'primary',
    },
  }
);

const buttonTextVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      solid: 'text-white',
      outline: 'text-blue-500',
      ghost: 'text-blue-500',
      link: 'text-blue-500 underline',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    action: {
      primary: '',
      secondary: '',
      positive: '',
      negative: '',
    },
  },
  compoundVariants: [
    { variant: 'outline', action: 'primary', className: 'text-blue-500' },
    { variant: 'outline', action: 'secondary', className: 'text-neutral-500' },
    { variant: 'outline', action: 'positive', className: 'text-green-500' },
    { variant: 'outline', action: 'negative', className: 'text-red-500' },
    { variant: 'ghost', action: 'primary', className: 'text-blue-500' },
    { variant: 'ghost', action: 'secondary', className: 'text-neutral-500' },
    { variant: 'ghost', action: 'positive', className: 'text-green-500' },
    { variant: 'ghost', action: 'negative', className: 'text-red-500' },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    action: 'primary',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  isDisabled?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      variant,
      size,
      action,
      isLoading = false,
      isDisabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Pressable
        ref={ref}
        disabled={isDisabled || isLoading}
        className={buttonVariants({ variant, size, action, className })}
        style={[isDisabled && { opacity: 0.5 }]}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'solid' ? '#ffffff' : '#3B82F6'}
          />
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export interface ButtonTextProps {
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonTextVariants>['variant'];
  size?: VariantProps<typeof buttonTextVariants>['size'];
  action?: VariantProps<typeof buttonTextVariants>['action'];
  className?: string;
}

export function ButtonText({
  children,
  variant = 'solid',
  size = 'md',
  action = 'primary',
  className,
}: ButtonTextProps) {
  return (
    <Text className={buttonTextVariants({ variant, size, action, className })}>
      {children}
    </Text>
  );
}

export interface ButtonIconProps {
  as: React.ComponentType<{ size?: number; color?: string }>;
  size?: number;
  color?: string;
}

export function ButtonIcon({ as: Icon, size = 20, color = '#ffffff' }: ButtonIconProps) {
  return <Icon size={size} color={color} />;
}

export interface ButtonSpinnerProps {
  color?: string;
}

export function ButtonSpinner({ color = '#ffffff' }: ButtonSpinnerProps) {
  return <ActivityIndicator size="small" color={color} />;
}

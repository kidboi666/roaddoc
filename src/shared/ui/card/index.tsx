import { View, ViewProps } from 'react-native';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useSettings } from '@/shared/hooks';

const cardVariants = cva('rounded-2xl overflow-hidden', {
  variants: {
    variant: {
      elevated: 'bg-card',
      outline: 'bg-card border border-border',
      ghost: 'bg-transparent',
      filled: 'bg-secondary',
    },
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<View, CardProps>(
  ({ variant, size, className, style, ...props }, ref) => {
    const { isDark } = useSettings();

    const shadowStyle =
      variant === 'elevated'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: 12,
            elevation: isDark ? 0 : 4,
          }
        : {};

    return (
      <View
        ref={ref}
        className={cardVariants({ variant, size, className })}
        style={[shadowStyle, style]}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

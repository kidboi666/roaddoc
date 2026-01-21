import { View, ViewProps, useColorScheme } from 'react-native';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-2xl overflow-hidden', {
  variants: {
    variant: {
      elevated: 'bg-white dark:bg-neutral-800',
      outline: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
      ghost: 'bg-transparent',
      filled: 'bg-neutral-100 dark:bg-neutral-800',
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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

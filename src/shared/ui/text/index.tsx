import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const textVariants = cva('text-foreground', {
  variants: {
    size: {
      '2xs': 'text-[10px]',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    },
    bold: {
      true: 'font-bold',
      false: 'font-normal',
    },
    italic: {
      true: 'italic',
      false: '',
    },
    underline: {
      true: 'underline',
      false: '',
    },
    strikeThrough: {
      true: 'line-through',
      false: '',
    },
    sub: {
      true: 'text-xs',
      false: '',
    },
    highlight: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    sub: false,
    highlight: false,
  },
});

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {}

export const Text = forwardRef<RNText, TextProps>(
  (
    {
      size,
      bold,
      italic,
      underline,
      strikeThrough,
      sub,
      highlight,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <RNText
        ref={ref}
        className={textVariants({
          size,
          bold,
          italic,
          underline,
          strikeThrough,
          sub,
          highlight,
          className,
        })}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

import { View, ViewProps } from 'react-native';
import { forwardRef } from 'react';

export interface BoxProps extends ViewProps {
  className?: string;
}

export const Box = forwardRef<View, BoxProps>(({ className, ...props }, ref) => {
  return <View ref={ref} className={className} {...props} />;
});

Box.displayName = 'Box';

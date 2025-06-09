import type { ReactNode } from 'react';

import { cn } from '@/ui/lib/utils';

interface SectionTitleProps {
  className?: string;
  children: ReactNode;
  hasBorder?: boolean;
  customMargin?: boolean;
  customPadding?: boolean;
}

export const SectionTitle = ({
  children,
  className,
  hasBorder,
  customMargin,
  customPadding,
}: SectionTitleProps) => {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold',
        {
          'mt-16 mb-4': !customMargin,
          'py-2': !customPadding,
          'border-b border-border': hasBorder,
        },
        className
      )}
    >
      {children}
    </h3>
  );
};

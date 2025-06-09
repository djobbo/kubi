import { useRouter } from '@tanstack/react-router';
import nprogress from 'nprogress';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { colors } from '@/ui/theme';

interface PageLoaderProps {
  children: ReactNode;
}

nprogress.configure({ showSpinner: false });

export const PageLoader = ({ children }: PageLoaderProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onBeforeLoadUnsubscribe = router.subscribe('onBeforeLoad', ({ pathChanged }) => {
      if (!pathChanged) return;

      nprogress.start();
      setLoading(true);
    });
    const onLoadUnsubscribe = router.subscribe('onLoad', () => {
      nprogress.done();
      setLoading(false);
    });

    return () => {
      onBeforeLoadUnsubscribe();
      onLoadUnsubscribe();
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 flex items-end justify-end z-50 p-4 pointer-events-none"
      style={{
        background: `linear-gradient(to top, ${colors.background}, rgba(0, 0, 0, 0))`,
      }}
    >
      {children}
    </div>
  );
};

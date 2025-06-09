import { createFileRoute, redirect } from '@tanstack/react-router';

import { env } from '@/env';

export const Route = createFileRoute('/(social)/donate')({
  beforeLoad: () => {
    throw redirect({ href: env.SOCIAL_KOFI_URL });
  },
});

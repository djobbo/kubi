import { createServerFn } from '@tanstack/react-start';
import { parseCookies } from 'vinxi/http';

import type { SessionValidationResult } from '../api';
import { validateSessionToken } from '../api';
import { AUTH_COOKIE_NAME, deleteSessionTokenCookie } from '../cookies';

export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionValidationResult> => {
    const sessionId = parseCookies()[AUTH_COOKIE_NAME];
    if (!sessionId) {
      return null;
    }

    const session = await validateSessionToken(sessionId);

    if (!session) {
      deleteSessionTokenCookie();
      return null;
    }

    return session;
  }
);

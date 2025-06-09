import { submitForm } from '@/helpers/submit-form';
import { useRootContext } from '@/hooks/useRootContext';
import type { APIRoute as discordAPIRoute } from '@/routes/api/auth/discord';
import type { APIRoute as logoutAPIRoute } from '@/routes/api/auth/logout';

import type { getSession } from './functions/getSession';

const getSessionData = (
  session: Awaited<ReturnType<typeof getSession>>
):
  | {
      isLoggedIn: false;
      session: null;
    }
  | {
      isLoggedIn: true;
      session: Awaited<ReturnType<typeof getSession>>;
    } => {
  if (session) {
    return {
      isLoggedIn: true,
      session,
    };
  }

  return {
    isLoggedIn: false,
    session: null,
  };
};

export const useAuth = () => {
  const rootContext = useRootContext();

  return {
    ...getSessionData(rootContext.session),
    logIn: () => submitForm('GET', '/api/auth/discord' satisfies (typeof discordAPIRoute)['path']),
    logOut: () => {
      submitForm('POST', '/api/auth/logout' satisfies (typeof logoutAPIRoute)['path']);
    },
  } as const;
};

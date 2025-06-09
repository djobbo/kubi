import { createAPIFileRoute } from '@tanstack/react-start/api';
import { generateState } from 'arctic';
import { setCookie, setHeader } from 'vinxi/http';

import { env } from '@/env';
import { DISCORD_OAUTH_STATE_COOKIE_NAME, discord } from '@/features/auth/providers';

const COOKIE_MAX_AGE_SECONDS = 60 * 10;

export const APIRoute = createAPIFileRoute('/api/auth/discord')({
  GET: async () => {
    const state = generateState();

    const url = discord.createAuthorizationURL(state, null, [
      'identify',
      'email',
      'guilds',
      'guilds.members.read',
    ]);

    setCookie(DISCORD_OAUTH_STATE_COOKIE_NAME, state, {
      path: '/',
      secure: env.IS_PROD,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE_SECONDS,
      sameSite: 'lax',
    });

    setHeader('Location', url.toString());

    return new Response(null, { status: 302 });
  },
});

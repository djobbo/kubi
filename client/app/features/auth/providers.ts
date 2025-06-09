import { Discord } from 'arctic';

import { env } from '@/env';

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  env.DISCORD_REDIRECT_URI
);

export const DISCORD_OAUTH_STATE_COOKIE_NAME = 'discord_oauth_state';

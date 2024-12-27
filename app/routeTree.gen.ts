/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LandingImport } from './routes/landing'
import { Route as IndexImport } from './routes/index'
import { Route as socialTwitterImport } from './routes/(social)/twitter'
import { Route as socialKofiImport } from './routes/(social)/kofi'
import { Route as socialGithubImport } from './routes/(social)/github'
import { Route as socialDiscordImport } from './routes/(social)/discord'
import { Route as StatsPlayerPlayerIdImport } from './routes/stats/player/$playerId'
import { Route as StatsClanClanIdImport } from './routes/stats/clan/$clanId'

// Create/Update Routes

const LandingRoute = LandingImport.update({
  id: '/landing',
  path: '/landing',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const socialTwitterRoute = socialTwitterImport.update({
  id: '/(social)/twitter',
  path: '/twitter',
  getParentRoute: () => rootRoute,
} as any)

const socialKofiRoute = socialKofiImport.update({
  id: '/(social)/kofi',
  path: '/kofi',
  getParentRoute: () => rootRoute,
} as any)

const socialGithubRoute = socialGithubImport.update({
  id: '/(social)/github',
  path: '/github',
  getParentRoute: () => rootRoute,
} as any)

const socialDiscordRoute = socialDiscordImport.update({
  id: '/(social)/discord',
  path: '/discord',
  getParentRoute: () => rootRoute,
} as any)

const StatsPlayerPlayerIdRoute = StatsPlayerPlayerIdImport.update({
  id: '/stats/player/$playerId',
  path: '/stats/player/$playerId',
  getParentRoute: () => rootRoute,
} as any)

const StatsClanClanIdRoute = StatsClanClanIdImport.update({
  id: '/stats/clan/$clanId',
  path: '/stats/clan/$clanId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/landing': {
      id: '/landing'
      path: '/landing'
      fullPath: '/landing'
      preLoaderRoute: typeof LandingImport
      parentRoute: typeof rootRoute
    }
    '/(social)/discord': {
      id: '/(social)/discord'
      path: '/discord'
      fullPath: '/discord'
      preLoaderRoute: typeof socialDiscordImport
      parentRoute: typeof rootRoute
    }
    '/(social)/github': {
      id: '/(social)/github'
      path: '/github'
      fullPath: '/github'
      preLoaderRoute: typeof socialGithubImport
      parentRoute: typeof rootRoute
    }
    '/(social)/kofi': {
      id: '/(social)/kofi'
      path: '/kofi'
      fullPath: '/kofi'
      preLoaderRoute: typeof socialKofiImport
      parentRoute: typeof rootRoute
    }
    '/(social)/twitter': {
      id: '/(social)/twitter'
      path: '/twitter'
      fullPath: '/twitter'
      preLoaderRoute: typeof socialTwitterImport
      parentRoute: typeof rootRoute
    }
    '/stats/clan/$clanId': {
      id: '/stats/clan/$clanId'
      path: '/stats/clan/$clanId'
      fullPath: '/stats/clan/$clanId'
      preLoaderRoute: typeof StatsClanClanIdImport
      parentRoute: typeof rootRoute
    }
    '/stats/player/$playerId': {
      id: '/stats/player/$playerId'
      path: '/stats/player/$playerId'
      fullPath: '/stats/player/$playerId'
      preLoaderRoute: typeof StatsPlayerPlayerIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/landing': typeof LandingRoute
  '/discord': typeof socialDiscordRoute
  '/github': typeof socialGithubRoute
  '/kofi': typeof socialKofiRoute
  '/twitter': typeof socialTwitterRoute
  '/stats/clan/$clanId': typeof StatsClanClanIdRoute
  '/stats/player/$playerId': typeof StatsPlayerPlayerIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/landing': typeof LandingRoute
  '/discord': typeof socialDiscordRoute
  '/github': typeof socialGithubRoute
  '/kofi': typeof socialKofiRoute
  '/twitter': typeof socialTwitterRoute
  '/stats/clan/$clanId': typeof StatsClanClanIdRoute
  '/stats/player/$playerId': typeof StatsPlayerPlayerIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/landing': typeof LandingRoute
  '/(social)/discord': typeof socialDiscordRoute
  '/(social)/github': typeof socialGithubRoute
  '/(social)/kofi': typeof socialKofiRoute
  '/(social)/twitter': typeof socialTwitterRoute
  '/stats/clan/$clanId': typeof StatsClanClanIdRoute
  '/stats/player/$playerId': typeof StatsPlayerPlayerIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/landing'
    | '/discord'
    | '/github'
    | '/kofi'
    | '/twitter'
    | '/stats/clan/$clanId'
    | '/stats/player/$playerId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/landing'
    | '/discord'
    | '/github'
    | '/kofi'
    | '/twitter'
    | '/stats/clan/$clanId'
    | '/stats/player/$playerId'
  id:
    | '__root__'
    | '/'
    | '/landing'
    | '/(social)/discord'
    | '/(social)/github'
    | '/(social)/kofi'
    | '/(social)/twitter'
    | '/stats/clan/$clanId'
    | '/stats/player/$playerId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LandingRoute: typeof LandingRoute
  socialDiscordRoute: typeof socialDiscordRoute
  socialGithubRoute: typeof socialGithubRoute
  socialKofiRoute: typeof socialKofiRoute
  socialTwitterRoute: typeof socialTwitterRoute
  StatsClanClanIdRoute: typeof StatsClanClanIdRoute
  StatsPlayerPlayerIdRoute: typeof StatsPlayerPlayerIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LandingRoute: LandingRoute,
  socialDiscordRoute: socialDiscordRoute,
  socialGithubRoute: socialGithubRoute,
  socialKofiRoute: socialKofiRoute,
  socialTwitterRoute: socialTwitterRoute,
  StatsClanClanIdRoute: StatsClanClanIdRoute,
  StatsPlayerPlayerIdRoute: StatsPlayerPlayerIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/landing",
        "/(social)/discord",
        "/(social)/github",
        "/(social)/kofi",
        "/(social)/twitter",
        "/stats/clan/$clanId",
        "/stats/player/$playerId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/landing": {
      "filePath": "landing.tsx"
    },
    "/(social)/discord": {
      "filePath": "(social)/discord.tsx"
    },
    "/(social)/github": {
      "filePath": "(social)/github.tsx"
    },
    "/(social)/kofi": {
      "filePath": "(social)/kofi.tsx"
    },
    "/(social)/twitter": {
      "filePath": "(social)/twitter.tsx"
    },
    "/stats/clan/$clanId": {
      "filePath": "stats/clan/$clanId.tsx"
    },
    "/stats/player/$playerId": {
      "filePath": "stats/player/$playerId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */

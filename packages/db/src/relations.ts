import { defineRelations } from "drizzle-orm"
import { bookmarksTable } from "./schema/auth/bookmarks"
import { oauthAccountsTable } from "./schema/auth/oauth-accounts"
import { sessionsTable } from "./schema/auth/sessions"
import { usersTable } from "./schema/auth/users"
import { playerHistoryTable } from "./schema/archive/brawlhalla/player-history"
import { playerLegendHistoryTable } from "./schema/archive/brawlhalla/player-legend-history"
import { playerWeaponHistoryTable } from "./schema/archive/brawlhalla/player-weapon-history"

const schema = {
  usersTable,
  sessionsTable,
  bookmarksTable,
  oauthAccountsTable,
  playerHistoryTable,
  playerLegendHistoryTable,
  playerWeaponHistoryTable,
}

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    bookmarks: r.many.bookmarksTable(),
    oauthAccounts: r.many.oauthAccountsTable(),
    sessions: r.many.sessionsTable(),
  },
  sessionsTable: {
    user: r.one.usersTable(),
  },
  bookmarksTable: {
    user: r.one.usersTable(),
  },
  oauthAccountsTable: {
    user: r.one.usersTable(),
  },
  playerHistoryTable: {
    legendHistory: r.many.playerLegendHistoryTable(),
    weaponHistory: r.many.playerWeaponHistoryTable(),
  },
  playerLegendHistoryTable: {
    playerHistory: r.one.playerHistoryTable(),
  },
  playerWeaponHistoryTable: {
    playerHistory: r.one.playerHistoryTable(),
  },
}))

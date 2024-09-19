import {DrizzlePostgreSQLAdapter} from "@lucia-auth/adapter-drizzle"
import {Lucia} from "lucia"

import {db} from "@/db"
import {
  sessionsTable,
  type User as DatabaseUser,
  usersTable,
} from "@/db/schema"

const adapter = new DrizzlePostgreSQLAdapter(db, sessionsTable, usersTable)

export const lucia = new Lucia(adapter, {
  sessionCookie: {attributes: {secure: process.env.NODE_ENV === "production"}},
  getUserAttributes: (attr) => ({
    id: attr.id,
    name: attr.name,
    firstName: attr.firstName,
    lastName: attr.lastName,
    avatarUrl: attr.avatarUrl,
    email: attr.email,
  }),
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUser;
  }
}

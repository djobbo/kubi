import postgres from "postgres"

import { env } from "@/env"

export async function connectToDatabase() {
  const url = env.DATABASE_URL

  try {
    const sql = postgres(url, {
      max: 10, // Connection pool size
      idle_timeout: 20, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
    })

    // Test the connection
    await sql`SELECT 1`
    return sql
  } catch (error) {
    console.error("Failed to connect to database:", error)
    return null
  }
}

export async function query(queryText: string, params: any[] = []) {
  const sql = await connectToDatabase()

  if (!sql) {
    throw new Error("Failed to connect to database")
  }

  try {
    // Convert named parameters to positional parameters
    const result = await sql.unsafe(queryText, params)
    return {
      rows: result,
      fields: result[0] ? Object.keys(result[0]).map((name) => ({ name })) : [],
    }
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

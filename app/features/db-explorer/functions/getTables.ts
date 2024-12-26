import { createServerFn } from "@tanstack/start"
import { z } from "zod"

import { query } from "../lib"

export const getTables = createServerFn({ method: "GET" }).handler(async () => {
  const result = await query(`
          SELECT
            table_schema,
            table_name,
            (
              SELECT count(*)
              FROM information_schema.columns
              WHERE table_schema = t.table_schema
              AND table_name = t.table_name
            ) as column_count
          FROM information_schema.tables t
          WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
          ORDER BY table_schema, table_name;
        `)

  const tables = result.rows.map((table) => ({
    schema: table.table_schema,
    name: table.table_name,
    columnCount: table.column_count,
  }))

  return tables
})

export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  default: any | null
  maxLength: number | null
}

export const getTableColumns = createServerFn({ method: "GET" })
  .validator(
    z.object({
      schema: z.string(),
      table: z.string(),
    }),
  )
  .handler(async ({ data: { schema, table } }) => {
    const result = await query(
      `
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = $1
    AND table_name = $2
    ORDER BY ordinal_position;
  `,
      [schema, table],
    )

    const columns = result.rows.map<TableColumn>((column) => ({
      name: column.column_name,
      type: column.data_type,
      nullable: column.is_nullable === "YES",
      default: column.column_default,
      maxLength: column.character_maximum_length,
    }))

    return columns
  })

export const getTableData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      schema: z.string(),
      table: z.string(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
  )
  .handler(async ({ data: { schema, table, page = 1, pageSize = 50 } }) => {
    const offset = (page - 1) * pageSize

    const [data, count] = await Promise.all([
      query(
        `
      SELECT *
      FROM "${schema}"."${table}"
      LIMIT $1 OFFSET $2;
    `,
        [pageSize, offset],
      ),
      query(`
      SELECT count(*) as total
      FROM "${schema}"."${table}";
    `),
    ])

    const total = parseInt(count.rows[0].total)

    return {
      rows: data.rows.map((row) => JSON.parse(JSON.stringify(row))),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  })

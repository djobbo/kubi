# Database Schema

PostgreSQL database schema for storing historical Brawlhalla player data using Drizzle ORM.

## Setup

1. Install dependencies:

```bash
bun install
```

2. Set up your database connection:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Generate migrations:

```bash
bun run db:generate
```

4. Run migrations:

```bash
bun run db:migrate
```

Or push schema directly (for development):

```bash
bun run db:push
```

5. Open Drizzle Studio:

```bash
bun run db:studio
```

## Schema Overview

### `player_history`

Main table storing historical player data with a hybrid approach:

- **Extracted columns**: Frequently queried fields (name, xp, level, rating, etc.) for fast ranking queries
- **JSONB column**: Full API response data for flexibility and future field extraction

### `player_legend_history`

Stores legend-specific stats per player snapshot:

- Links to `player_history` via `player_history_id`
- Extracts key legend stats (games, wins, rating, etc.) as columns
- Stores weapon damage stats in JSONB

### `player_weapon_history`

Stores weapon-specific stats aggregated across all legends:

- Links to `player_history` via `player_history_id`
- Aggregates stats from `weapon_one` and `weapon_two` across all player's legends
- Enables ranking queries like "top players by wins with Axe"

## Indexes

All tables include optimized indexes for:

- Filtering by player ID with date sorting
- Ranking queries on numeric fields (rating, xp, wins, etc.)
- Querying by legend/weapon with ranking

## Usage

Import the schema:

```typescript
import * as schema from "@dair/db"
```

Use with Drizzle:

```typescript
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@dair/db"

const queryClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(queryClient, { schema })
```

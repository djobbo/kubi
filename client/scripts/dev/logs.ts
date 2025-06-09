import { $ } from "bun"

import { COMPOSE_FILE } from "./constants"

await $`docker compose -f ${COMPOSE_FILE} logs -f --tail 100`

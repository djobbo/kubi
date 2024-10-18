import { $ } from "bun"

import { COMPOSE_FILE } from "./constants"

const build = Bun.argv.includes("--build")

if (build) {
  await $`docker compose -f ${COMPOSE_FILE} down`
  await $`docker compose -f ${COMPOSE_FILE} build --no-cache`
}
await $`docker compose -f ${COMPOSE_FILE} up -d`

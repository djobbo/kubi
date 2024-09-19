import {$} from "bun"

await $`docker compose logs -f --tail 100`

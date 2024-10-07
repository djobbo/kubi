import { StartClient } from "@tanstack/start"
import { hydrateRoot } from "react-dom/client"

import { createRouter } from "@/router"

const router = createRouter()

const root = document.getElementById("root")
// eslint-disable-next-line lingui/no-unlocalized-strings
if (!root) throw new Error("No root element found")

hydrateRoot(root, <StartClient router={router} />)

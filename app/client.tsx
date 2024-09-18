import { hydrateRoot } from "react-dom/client"
import { StartClient } from "@tanstack/start"
import { createRouter } from "./router"
import "./global.css"

const router = createRouter()

const root = document.getElementById("root")
if (!root) throw new Error("No root element found")

hydrateRoot(root, <StartClient router={router} />)

import "./global.css"

import {StartClient} from "@tanstack/start"
import {hydrateRoot} from "react-dom/client"

import {createRouter} from "./router"

const router = createRouter()

const root = document.getElementById("root")
if (!root) throw new Error("No root element found")

hydrateRoot(root, <StartClient router={router} />)

import { Layer } from "effect"
import * as HonoApi from "./routes"
import { Runtime } from "./runtime"

Runtime.runFork(Layer.launch(HonoApi.fromEnv))

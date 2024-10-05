import type { SceneBox, SceneCylinder, SceneObject } from "./types"

export const isBox = (object: SceneObject): object is SceneBox => {
  return object.type === "box"
}

export const isCylinder = (object: SceneObject): object is SceneCylinder => {
  return object.type === "cylinder"
}

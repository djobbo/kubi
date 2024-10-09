import type { Color, Euler, Vector3 } from "three"

import type { Prettify } from "@/helpers/prettify"

export interface Box {
  id: string
  type: "box"
  width: number
  depth: number
  height: number
}

export interface Cylinder {
  id: string
  type: "cylinder"
  radius: number
  height: number
}

export type Object = Box | Cylinder

export type SceneObject<T = Box | Cylinder> = Prettify<
  T & {
    position: Vector3
    rotation: Euler
    color: Color
  }
>

export type SceneBox = SceneObject<Box>
export type SceneCylinder = SceneObject<Cylinder>

export interface Scene {
  objects: SceneObject[]
}

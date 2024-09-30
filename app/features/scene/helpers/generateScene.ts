import { Color, Euler, Vector3 } from "three"

import type { Prettify } from "@/helpers/prettify"

import { isIntersecting } from "./collisions"

export interface Box {
  type: "box"
  width: number
  depth: number
  height: number
}

export interface Cylinder {
  type: "cylinder"
  radius: number
  height: number
}

type Object = Box | Cylinder

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

// Helper functions
const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// const getRandomPosition = (width: number, depth: number): Vector3 => {
//   return new Vector3(getRandomFloat(0, width), 0, getRandomFloat(0, depth))
// }

const getRandomPosition = (
  minX: number,
  maxX: number,
  minY = 0,
  maxY = 0,
  minZ = 0,
  maxZ = 0,
): Vector3 => {
  return new Vector3(
    getRandomFloat(minX, maxX),
    getRandomFloat(minY, maxY),
    getRandomFloat(minZ, maxZ),
  )
}

const getRandomRotation = (): number => {
  return Math.random() * Math.PI * 2 // Random rotation around the vertical axis (Y)
}

const getRandomColor = () => {
  return new Color(Math.random(), Math.random(), Math.random())
}

const createRandomBox = (
  minSize: Box,
  maxSize: Box,
  sizeMultiplier = 1,
): Box => {
  return {
    type: "box",
    width: getRandomFloat(minSize.width, maxSize.width) * sizeMultiplier,
    depth: getRandomFloat(minSize.depth, maxSize.depth) * sizeMultiplier,
    height: getRandomFloat(minSize.height, maxSize.height) * sizeMultiplier,
  }
}

const createRandomCylinder = (
  minSize: Cylinder,
  maxSize: Cylinder,
  sizeMultiplier = 1,
): Cylinder => {
  return {
    type: "cylinder",
    radius: getRandomFloat(minSize.radius, maxSize.radius) * sizeMultiplier,
    height: getRandomFloat(minSize.height, maxSize.height) * sizeMultiplier,
  }
}

function placeObject(
  scene: Scene,
  object: Object,
  floorWidth: number,
  floorDepth: number,
  maxHeight: number,
): SceneObject | null {
  const sceneObject: SceneObject = {
    ...object,
    position: new Vector3(0, object.height / 2, 0),
    rotation: new Euler(),
    color: getRandomColor(),
  }

  let placed = false
  let attempts = 0
  const maxAttempts = 100

  while (!placed && attempts < maxAttempts) {
    const pos = getRandomPosition(
      -floorWidth / 2,
      floorWidth / 2,
      0,
      0,
      -floorDepth / 2,
      floorDepth / 2,
    )
    const rotation = getRandomRotation()

    sceneObject.position.x = pos.x
    sceneObject.position.z = pos.z
    sceneObject.rotation.y = rotation

    // if (sceneObject.type === "box") {
    //   sceneObject.position.x -= sceneObject.width / 2
    //   sceneObject.position.z -= sceneObject.depth / 2
    // }

    // Determine initial height based on stacking
    let height = sceneObject.height / 2

    // Check for potential stacking (based on existing objects in the scene)
    for (const existingObj of scene.objects) {
      if (isIntersecting(sceneObject, existingObj)) {
        height =
          existingObj.position.y +
          existingObj.height / 2 +
          sceneObject.height / 2
      }
    }

    if (height + object.height <= maxHeight) {
      // No intersections found, place the object
      sceneObject.position.x = pos.x
      sceneObject.position.y = height
      sceneObject.position.z = pos.z
      sceneObject.rotation.y = rotation
      placed = true
    }

    attempts++
  }

  if (!placed) {
    return null
  }

  return sceneObject
}

const getSizeMultiplier = (nthObject: number, totalObjects: number): number => {
  return 1 - nthObject / totalObjects
}

// Main function to create and place objects
export function generateScene(
  numObjects: number,
  floorWidth: number,
  floorDepth: number,
  maxHeight: number,
  minBoxSize: Box,
  maxBoxSize: Box,
  minCylSize: Cylinder,
  maxCylSize: Cylinder,
): Scene {
  const scene: Scene = { objects: [] }

  for (let i = 0; i < numObjects; i++) {
    const isBox = Math.random() < 0.5

    const sizeMultiplier = getSizeMultiplier(i, numObjects)

    const object = isBox
      ? createRandomBox(minBoxSize, maxBoxSize, sizeMultiplier)
      : createRandomCylinder(minCylSize, maxCylSize, sizeMultiplier)

    const sceneObject = placeObject(
      scene,
      object,
      floorWidth,
      floorDepth,
      maxHeight,
    )

    if (sceneObject) {
      scene.objects.push(sceneObject)
    }
  }

  return scene
}

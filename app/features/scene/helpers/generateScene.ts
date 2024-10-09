import { Euler, Vector3 } from "three"
import { v4 as uuidV4 } from "uuid"

import { getRandomColor, getRandomFloat } from "@/features/scene/helpers/random"
import type {
  Box,
  Cylinder,
  Object,
  Scene,
  SceneObject,
} from "@/features/scene/types"

import { isCollision } from "./collisions"

const getRandomBox = (minSize: Box, maxSize: Box, sizeMultiplier = 1): Box => {
  return {
    id: uuidV4(),
    type: "box",
    width: getRandomFloat(minSize.width, maxSize.width) * sizeMultiplier,
    depth: getRandomFloat(minSize.depth, maxSize.depth) * sizeMultiplier,
    height: getRandomFloat(minSize.height, maxSize.height) * sizeMultiplier,
  }
}

const getRandomCylinder = (
  minSize: Cylinder,
  maxSize: Cylinder,
  sizeMultiplier = 1,
): Cylinder => {
  return {
    id: uuidV4(),
    type: "cylinder",
    radius: getRandomFloat(minSize.radius, maxSize.radius) * sizeMultiplier,
    height: getRandomFloat(minSize.height, maxSize.height) * sizeMultiplier,
  }
}

const placeObject = (
  scene: Scene,
  object: Object,
  maxTries = 100,
): SceneObject => {
  const sceneObject: SceneObject = {
    ...object,
    position: new Vector3(0, object.height / 2, 0),
    rotation: new Euler(),
    color: getRandomColor(),
  }

  for (let i = 0; i < maxTries; i++) {
    sceneObject.position.setX(getRandomFloat(-1, 1))
    sceneObject.position.setZ(getRandomFloat(-1, 1))

    const isValid = scene.objects.some((object) => {
      return !isCollision(sceneObject, object)
    })

    if (!isValid) continue

    return sceneObject
  }

  return sceneObject
}

export const generateScene = (objectsCount = 4) => {
  const scene: Scene = {
    objects: [],
  }

  for (let i = 0; i < objectsCount; i++) {
    const object =
      i % 2 === 0
        ? getRandomBox(
            { id: "min_box", type: "box", width: 0.2, depth: 0.2, height: 0.2 },
            { id: "max_box", type: "box", width: 4, depth: 4, height: 2.5 },
          )
        : getRandomCylinder(
            { id: "min_cylinder", type: "cylinder", radius: 0.2, height: 0.5 },
            { id: "max_cylinder", type: "cylinder", radius: 2, height: 2.5 },
          )
    const sceneObject = placeObject(scene, object)

    scene.objects.push(sceneObject)
  }

  return scene
}

import { isBox, isCylinder } from "@/features/scene/assertions"
import type {
  SceneBox,
  SceneCylinder,
  SceneObject,
} from "@/features/scene/types"

const isCylinderCollision = (c1: SceneCylinder, c2: SceneCylinder): boolean => {
  const dist = Math.sqrt(
    (c1.position.x - c2.position.x) ** 2 + (c1.position.y - c2.position.y) ** 2,
  )

  return dist < c1.radius + c2.radius
}

const isBoxCollision = (b1: SceneBox, b2: SceneBox): boolean => {
  return !(
    b1.position.x + b1.width < b2.position.x ||
    b2.position.x + b2.width < b1.position.x ||
    b1.position.y + b1.height < b2.position.y ||
    b2.position.y + b2.height < b1.position.y
  )
}

const isBoxCylinderCollision = (
  box: SceneBox,
  cylinder: SceneCylinder,
): boolean => {
  const nearestX = Math.max(
    box.position.x,
    Math.min(cylinder.position.x, box.position.x + box.width),
  )
  const nearestY = Math.max(
    box.position.y,
    Math.min(cylinder.position.y, box.position.y + box.height),
  )
  const squareDist =
    (nearestX - cylinder.position.x) ** 2 +
    (nearestY - cylinder.position.y) ** 2

  return squareDist < cylinder.radius ** 2
}

export const isCollision = (
  object1: SceneObject,
  object2: SceneObject,
): boolean => {
  if (isBox(object1) && isBox(object2)) {
    return isBoxCollision(object1, object2)
  }

  if (isCylinder(object1) && isCylinder(object2)) {
    return isCylinderCollision(object1, object2)
  }

  if (isBox(object1) && isCylinder(object2)) {
    return isBoxCylinderCollision(object1, object2)
  }

  if (isCylinder(object1) && isBox(object2)) {
    return isBoxCylinderCollision(object2, object1)
  }

  return false
}

import { Vector3 } from "three"

import type { SceneBox, SceneObject } from "./generateScene"

// Helper function to check overlapping of projections on an axis
function overlap(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
): boolean {
  return Math.max(minA, minB) <= Math.min(maxA, maxB)
}

// Rotate a 2D point around another point
function rotatePoint(
  px: number,
  pz: number,
  ox: number,
  oz: number,
  angle: number,
): Vector3 {
  const s = Math.sin(angle)
  const c = Math.cos(angle)

  // Translate point back to origin
  const x = px - ox
  const z = pz - oz

  // Rotate point
  const newX = x * c - z * s
  const newZ = x * s + z * c

  // Translate point back
  // return { x: newX + ox, z: newZ + oz }
  return new Vector3(newX + ox, 0, newZ + oz)
}

// Get the corners of a rotated box
function getBoxCorners(box: SceneBox): Vector3[] {
  const hw = box.width / 2
  const hd = box.depth / 2

  const corners: Vector3[] = [
    new Vector3(box.position.x - hw, 0, box.position.z - hd),
    new Vector3(box.position.x + hw, 0, box.position.z - hd),
    new Vector3(box.position.x + hw, 0, box.position.z + hd),
    new Vector3(box.position.x - hw, 0, box.position.z + hd),
  ]

  return corners.map((corner) => {
    return rotatePoint(
      corner.x,
      corner.z,
      box.position.x,
      box.position.z,
      box.rotation.y,
    )
  })
}

// Get the projection of a set of points on an axis
function projectCorners(
  corners: Vector3[],
  axis: Vector3,
): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity

  for (const corner of corners) {
    const projection = corner.x * axis.x + corner.z * axis.z
    if (projection < min) min = projection
    if (projection > max) max = projection
  }

  return { min, max }
}

// Separating Axis Theorem (SAT) for rotated boxes
function satForBoxes(box1: SceneBox, box2: SceneBox): boolean {
  const axes: Vector3[] = [
    new Vector3(Math.cos(box1.rotation.y), 0, Math.sin(box1.rotation.y)),
    new Vector3(-Math.sin(box1.rotation.y), 0, Math.cos(box1.rotation.y)),
    new Vector3(Math.cos(box2.rotation.y), 0, Math.sin(box2.rotation.y)),
    new Vector3(-Math.sin(box2.rotation.y), 0, Math.cos(box2.rotation.y)),
  ]

  const box1Corners = getBoxCorners(box1)
  const box2Corners = getBoxCorners(box2)

  for (const axis of axes) {
    const proj1 = projectCorners(box1Corners, axis)
    const proj2 = projectCorners(box2Corners, axis)

    if (!overlap(proj1.min, proj1.max, proj2.min, proj2.max)) {
      return false
    }
  }

  return true
}

export const isIntersecting = (
  obj1: SceneObject,
  obj2: SceneObject,
): boolean => {
  if (obj1.type === "box" && obj2.type === "box") {
    // Handle rotated box-box collision using SAT
    if (!satForBoxes(obj1, obj2)) return false

    // Check vertical overlap
    return !(
      obj1.position.y + obj1.height < obj2.position.y ||
      obj1.position.y > obj2.position.y + obj2.height
    )
  }

  if (obj1.type === "cylinder" && obj2.type === "cylinder") {
    // Simple cylinder-cylinder collision using bounding circles
    const distSq =
      (obj1.position.x - obj2.position.x) ** 2 +
      (obj1.position.z - obj2.position.z) ** 2
    const radiusSum = obj1.radius + obj2.radius
    const circlesOverlap = distSq <= radiusSum * radiusSum

    // Check vertical overlap
    const verticallyOverlapping = !(
      obj1.position.y + obj1.height < obj2.position.y ||
      obj1.position.y > obj2.position.y + obj2.height
    )

    return circlesOverlap && verticallyOverlapping
  }

  // Handle box-cylinder collision
  const box = obj1.type === "box" ? obj1 : obj2
  const cylinder = obj1.type === "cylinder" ? obj1 : obj2

  // Get corners of the rotated box
  const boxCorners = getBoxCorners(box)

  // Project the cylinder as a circle on the XZ plane
  const circleCenter = { x: cylinder.position.x, z: cylinder.position.z }
  const circleRadius = cylinder.radius

  // Check if any box corner is inside the cylinder's bounding circle
  for (const corner of boxCorners) {
    const distSq =
      (corner.x - circleCenter.x) ** 2 + (corner.z - circleCenter.z) ** 2

    if (distSq <= circleRadius * circleRadius) {
      // Check vertical overlap
      return !(
        box.position.y + box.height < cylinder.position.y ||
        box.position.y > cylinder.position.y + cylinder.height
      )
    }
  }

  // Check if the circle center is inside the box (using SAT)
  const axes: Vector3[] = [
    new Vector3(Math.cos(box.rotation.y), 0, Math.sin(box.rotation.y)),
    new Vector3(-Math.sin(box.rotation.y), 0, Math.cos(box.rotation.y)),
  ]

  for (const axis of axes) {
    const projBox = projectCorners(boxCorners, axis)
    const projCircleCenter = circleCenter.x * axis.x + circleCenter.z * axis.z

    const minCircleProj = projCircleCenter - circleRadius
    const maxCircleProj = projCircleCenter + circleRadius

    if (!overlap(projBox.min, projBox.max, minCircleProj, maxCircleProj)) {
      return false
    }
  }

  // Check vertical overlap
  return !(
    box.position.y + box.height < cylinder.position.y ||
    box.position.y > cylinder.position.y + cylinder.height
  )
}

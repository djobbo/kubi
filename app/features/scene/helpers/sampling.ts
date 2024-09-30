// Type Definitions
interface Ellipse {
  majorRadius: number
  minorRadius: number
  x: number
  z: number
  rotation: number // Rotation angle in radians
}

// Helper functions
function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Convert a point to local coordinates of an ellipse (after applying rotation)
function toLocalEllipseCoords(
  x: number,
  z: number,
  ellipse: Ellipse,
): { x: number; z: number } {
  const cosTheta = Math.cos(-ellipse.rotation)
  const sinTheta = Math.sin(-ellipse.rotation)
  const dx = x - ellipse.x
  const dz = z - ellipse.z
  return {
    x: cosTheta * dx - sinTheta * dz,
    z: sinTheta * dx + cosTheta * dz,
  }
}

// Check if two ellipses are overlapping
function areEllipsesOverlapping(e1: Ellipse, e2: Ellipse): boolean {
  const localE2 = toLocalEllipseCoords(e2.x, e2.z, e1)
  const distanceX = localE2.x / e1.majorRadius
  const distanceZ = localE2.z / e1.minorRadius

  // Ellipse equation: (x/a)^2 + (z/b)^2 <= 1 means the point is inside the ellipse
  const dist1 = distanceX * distanceX + distanceZ * distanceZ

  const localE1 = toLocalEllipseCoords(e1.x, e1.z, e2)
  const dist2 =
    (localE1.x / e2.majorRadius) ** 2 + (localE1.z / e2.minorRadius) ** 2

  return dist1 <= 1 || dist2 <= 1
}

// Poisson Disc Sampling function to place ellipses
export function poissonDiscSamplingEllipses(
  width: number,
  depth: number,
  minMajorRadius: number,
  maxMajorRadius: number,
  minMinorRadius: number,
  maxMinorRadius: number,
  numSamples: number,
): Ellipse[] {
  const gridCellSize = maxMajorRadius / Math.SQRT2 // Based on largest possible ellipse
  const gridWidth = Math.ceil(width / gridCellSize)
  const gridDepth = Math.ceil(depth / gridCellSize)

  const grid: (Ellipse | null)[][] = Array.from({ length: gridWidth }, () =>
    Array(gridDepth).fill(null),
  )
  const ellipses: Ellipse[] = []
  const processList: Ellipse[] = []

  // Helper to check if an ellipse can be placed at a location without overlapping
  function canPlaceEllipse(newEllipse: Ellipse): boolean {
    const gridX = Math.floor(newEllipse.x / gridCellSize)
    const gridZ = Math.floor(newEllipse.z / gridCellSize)

    const startX = Math.max(0, gridX - 2)
    const endX = Math.min(gridWidth - 1, gridX + 2)
    const startZ = Math.max(0, gridZ - 2)
    const endZ = Math.min(gridDepth - 1, gridZ + 2)

    for (let i = startX; i <= endX; i++) {
      for (let j = startZ; j <= endZ; j++) {
        const neighbor = grid[i][j]
        if (neighbor && areEllipsesOverlapping(newEllipse, neighbor)) {
          return false // Overlapping detected
        }
      }
    }
    return true
  }

  // Helper to add a new ellipse
  function addEllipse(
    x: number,
    z: number,
    majorRadius: number,
    minorRadius: number,
    rotation: number,
  ): void {
    const ellipse: Ellipse = { x, z, majorRadius, minorRadius, rotation }
    ellipses.push(ellipse)
    processList.push(ellipse)

    const gridX = Math.floor(x / gridCellSize)
    const gridZ = Math.floor(z / gridCellSize)
    grid[gridX][gridZ] = ellipse
  }

  // Initialize with a random starting ellipse
  const initialMajorRadius = getRandomFloat(minMajorRadius, maxMajorRadius)
  const initialMinorRadius = getRandomFloat(minMinorRadius, maxMinorRadius)
  const initialX = getRandomFloat(0, width)
  const initialZ = getRandomFloat(0, depth)
  const initialRotation = getRandomFloat(0, Math.PI * 2)
  addEllipse(
    initialX,
    initialZ,
    initialMajorRadius,
    initialMinorRadius,
    initialRotation,
  )

  // Poisson Disc Sampling process
  while (processList.length > 0 && ellipses.length < numSamples) {
    const current = processList.pop()!
    const numTries = 30 // Number of attempts to place a new ellipse around the current one

    for (let i = 0; i < numTries; i++) {
      const angle = getRandomFloat(0, Math.PI * 2)
      const distance = getRandomFloat(
        current.majorRadius,
        current.majorRadius + 2 * maxMajorRadius,
      )
      const newX = current.x + Math.cos(angle) * distance
      const newZ = current.z + Math.sin(angle) * distance
      const newMajorRadius = getRandomFloat(minMajorRadius, maxMajorRadius)
      const newMinorRadius = getRandomFloat(minMinorRadius, maxMinorRadius)
      const newRotation = getRandomFloat(0, Math.PI * 2)

      const newEllipse: Ellipse = {
        x: newX,
        z: newZ,
        majorRadius: newMajorRadius,
        minorRadius: newMinorRadius,
        rotation: newRotation,
      }

      if (
        newX >= 0 &&
        newX < width &&
        newZ >= 0 &&
        newZ < depth &&
        canPlaceEllipse(newEllipse)
      ) {
        addEllipse(newX, newZ, newMajorRadius, newMinorRadius, newRotation)
      }
    }
  }

  return ellipses
}

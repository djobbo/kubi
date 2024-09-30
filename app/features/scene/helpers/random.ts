import { Color, Vector3 } from "three"

export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const getRandomPosition = (
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

export const getRandomRotation = (): number => {
  return Math.random() * Math.PI * 2 // Random rotation around the vertical axis (Y)
}

export const getRandomColor = () => {
  return new Color(Math.random(), Math.random(), Math.random())
}

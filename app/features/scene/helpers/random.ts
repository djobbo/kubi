import { Color } from "three"

export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const getRandomColor = () => {
  return new Color(Math.random(), Math.random(), Math.random())
}

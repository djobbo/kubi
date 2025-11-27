import { sluggify } from "@dair/common/src/helpers/sluggify"

export const getEntitySlug = (id: number, name: string) => {
  return `${id}-${sluggify(name).slice(0, 24)}`
}

import { SceneBox } from "@/features/scene/components/objects/Box"
import { SceneCylinder } from "@/features/scene/components/objects/Cylinder"
import type { SceneObject } from "@/features/scene/types"

export const SceneObjects = ({ objects }: { objects: SceneObject[] }) => {
  return objects.map((object, index) => {
    switch (object.type) {
      case "box":
        return <SceneBox key={index} box={object} />
      case "cylinder":
        return <SceneCylinder key={index} cylinder={object} />
      default:
        return null
    }
  })
}
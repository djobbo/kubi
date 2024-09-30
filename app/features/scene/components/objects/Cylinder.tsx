import { Cylinder } from "@react-three/drei"

import type { SceneCylinder as SceneCylinderType } from "@/features/scene/types"

const DEFAULT_CYLINDER_SEGMENTS = 32

interface SceneCylinderProps {
  cylinder: SceneCylinderType
  segments?: number
}

export const SceneCylinder = ({
  cylinder,
  segments = DEFAULT_CYLINDER_SEGMENTS,
}: SceneCylinderProps) => {
  return (
    <Cylinder
      position={cylinder.position}
      rotation={cylinder.rotation}
      args={[cylinder.radius, cylinder.radius, cylinder.height, segments]}
      castShadow
      receiveShadow
      dispose={null}
    >
      <meshLambertMaterial color={cylinder.color} />
    </Cylinder>
  )
}

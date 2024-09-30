import { Box } from "@react-three/drei"

import type { SceneBox as SceneBoxType } from "@/features/scene/types"

interface SceneBoxProps {
  box: SceneBoxType
}

export const SceneBox = ({ box }: SceneBoxProps) => {
  return (
    <Box
      position={box.position}
      rotation={box.rotation}
      args={[box.width, box.height, box.depth]}
      castShadow
      receiveShadow
      dispose={null}
    >
      <meshLambertMaterial color={box.color} />
    </Box>
  )
}

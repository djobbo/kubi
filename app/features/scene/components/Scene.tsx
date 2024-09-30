import { Box, Cylinder, SoftShadows } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"

import type {
  Scene as SceneType,
  SceneBox as SceneBoxType,
  SceneCylinder as SceneCylinderType,
  SceneObject,
} from "../helpers/generateScene"

const CYLINDER_SEGMENTS = 32

const SceneBox = ({ box }: { box: SceneBoxType }) => {
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

const SceneCylinder = ({ cylinder }: { cylinder: SceneCylinderType }) => {
  return (
    <Cylinder
      position={cylinder.position}
      rotation={cylinder.rotation}
      args={[
        cylinder.radius,
        cylinder.radius,
        cylinder.height,
        CYLINDER_SEGMENTS,
      ]}
      castShadow
      receiveShadow
      dispose={null}
    >
      <meshLambertMaterial color={cylinder.color} />
    </Cylinder>
  )
}

const SceneObjects = ({ objects }: { objects: SceneObject[] }) => {
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

export const Scene = ({ scene }: { scene: SceneType }) => {
  return (
    <Canvas shadows camera={{ position: [-5, 2, 10], fov: 40 }}>
      <SoftShadows size={24} focus={0} samples={10} />
      <fog attach="fog" args={["white", 0, 40]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={1024}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-10, 10, -10, 10, 0.1, 50]}
        />
      </directionalLight>
      <pointLight position={[-10, 0, -20]} color="white" intensity={1} />
      <pointLight position={[0, -10, 0]} intensity={1} />
      <group position={[0, 0, 0]}>
        <SceneObjects objects={scene.objects} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>
        <gridHelper args={[20, 20, "lightgray", "lightgray"]} />
      </group>
    </Canvas>
  )
}

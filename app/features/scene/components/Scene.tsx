import {Box, Cylinder, SoftShadows} from "@react-three/drei"
import {Canvas} from "@react-three/fiber"
import {Color} from "three"

const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

interface SceneCube {
  type: "Box"
  position: [number, number, number]
  rotation: [number, number, number]
  dimensions: [number, number, number]
  color: Color
}

const getRandomColor = () => {
  return new Color(Math.random(), Math.random(), Math.random())
}

const getRandomCube = (): SceneCube => {
  const width = getRandomNumber(0.2, 3)
  const height = getRandomNumber(0.2, 3)
  const depth = getRandomNumber(0.2, 3)

  return {
    type: "Box",
    position: [getRandomNumber(-3, 3), height / 2, getRandomNumber(-3, 3)],
    rotation: [0, getRandomNumber(0, Math.PI), 0],
    dimensions: [width, height, depth],
    color: getRandomColor(),
    // color: new Color('#ffeedd')
  }
}

interface SceneCylinder {
  type: "Cylinder"
  position: [number, number, number]
  rotation: [number, number, number]
  dimensions: [number, number, number]
  color: Color
}

const getRandomCylinder = (): SceneCylinder => {
  const radiusTop = getRandomNumber(0.2, 0.8)
  // const radiusBottom = getRandomNumber(0.25, 1);
  const height = getRandomNumber(0.5, 3)

  return {
    type: "Cylinder",
    position: [getRandomNumber(-3, 3), height / 2, getRandomNumber(-3, 3)],
    rotation: [0, getRandomNumber(0, Math.PI), 0],
    dimensions: [radiusTop, radiusTop, height],
    color: getRandomColor(),
    // color: new Color('#ffeedd')
  }
}

type SceneObject = SceneCube | SceneCylinder

export const getRandomObjects = (): SceneObject[] => {
  const objectsCount = getRandomNumber(3, 6)

  return Array.from({length: objectsCount}, () => {
    const random = Math.random()

    if (random < 0.75) {
      return getRandomCube()
    }
    else {
      return getRandomCylinder()
    }
  })
}

const SceneCube = ({cube}: {cube: SceneCube}) => {
  return (
    <Box
      position={cube.position}
      rotation={cube.rotation}
      args={cube.dimensions}
      castShadow
      receiveShadow
      dispose={null}
    >
      <meshLambertMaterial color={cube.color} />
    </Box>
  )
}

const SceneCylinder = ({cylinder}: {cylinder: SceneCylinder}) => {
  return (
    <Cylinder
      position={cylinder.position}
      rotation={cylinder.rotation}
      args={cylinder.dimensions}
      castShadow
      receiveShadow
      dispose={null}
    >
      <meshLambertMaterial color={cylinder.color} />
    </Cylinder>
  )
}

const SceneObjects = ({objects}: {objects: SceneObject[]}) => {
  return objects.map((object, index) => {
    switch (object.type) {
      case "Box":
        return <SceneCube key={index} cube={object} />
      case "Cylinder":
        return <SceneCylinder key={index} cylinder={object} />
      default:
        return null
    }
  })
}

export const Scene = ({objects}: {objects: SceneObject[]}) => {
  return (
    <Canvas
      shadows camera={{position: [-5, 2, 10], fov: 40}}>
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
        <SceneObjects objects={objects} />
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

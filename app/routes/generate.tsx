import { createFileRoute } from "@tanstack/react-router"
import { Euler, Vector3 } from "three"

import { Scene } from "@/features/scene/components/Scene"
import { getInscribedAndCircumscribedRectangles } from "@/features/scene/helpers/ellipsisToRectangle"
import { getRandomColor } from "@/features/scene/helpers/random"
import { poissonDiscSamplingEllipses } from "@/features/scene/helpers/sampling"
import type { Scene as SceneType, SceneObject } from "@/features/scene/types"

export const Route = createFileRoute("/generate")({
  component: Home,
  loader: async () => {
    const width = 3 // Width of the floor
    const depth = 3 // Depth of the floor
    const minMajorRadius = 0.2 // Minimum major radius of the ellipses
    const maxMajorRadius = 2 // Maximum major radius of the ellipses
    const minMinorRadius = 0.1 // Minimum minor radius of the ellipses
    const maxMinorRadius = 1 // Maximum minor radius of the ellipses
    const numSamples = 4 // Number of ellipses to place

    const ellipses = poissonDiscSamplingEllipses(
      width,
      depth,
      minMajorRadius,
      maxMajorRadius,
      minMinorRadius,
      maxMinorRadius,
      numSamples,
    ).map((ellipse) => ({
      ...ellipse,
      x: ellipse.x - width / 2,
      z: ellipse.z - depth / 2,
    }))

    const rectangles = ellipses.map((ellipse) => {
      const { inscribed, circumscribed } =
        getInscribedAndCircumscribedRectangles(ellipse)

      return [
        {
          type: "cylinder",
          radius: Math.min(inscribed.width, inscribed.height) / 2,
          height: 0.4,
          rotation: new Euler(0, ellipse.rotation, 0),
          position: new Vector3(ellipse.x, 0.2, ellipse.z),
          color: getRandomColor(),
        },
        // {
        //   type: "cylinder",
        //   radius: Math.min(circumscribed.width, circumscribed.height) / 2,
        //   height: 0.2,
        //   rotation: new Euler(0, ellipse.rotation, 0),
        //   position: new Vector3(ellipse.x, 0.1, ellipse.z),
        //   color: getRandomColor(),
        // },
      ] satisfies SceneObject[]
    })

    const scene: SceneType = {
      objects: rectangles.flat(),
    }

    return {
      scene,
    }
  },
})

function Home() {
  const { scene } = Route.useLoaderData()

  return (
    <div className="w-full h-full">
      <Scene scene={scene} />
    </div>
  )
}

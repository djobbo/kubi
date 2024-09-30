import { createFileRoute, useRouter } from "@tanstack/react-router"

import { Scene } from "@/features/scene/components/Scene"
import type { Box, Cylinder } from "@/features/scene/helpers/generateScene"
import { generateScene } from "@/features/scene/helpers/generateScene"
import { Button } from "@/ui/components/button"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context: { session } }) => {
    const floorWidth = 3.5
    const floorDepth = 3.5
    const maxHeight = 6

    const minBoxSize: Box = { type: "box", width: 0.2, depth: 0.2, height: 0.2 }
    const maxBoxSize: Box = { type: "box", width: 4, depth: 4, height: 2.5 }

    const minCylSize: Cylinder = { type: "cylinder", radius: 0.2, height: 0.5 }
    const maxCylSize: Cylinder = { type: "cylinder", radius: 2, height: 2.5 }

    const scene = generateScene(
      5,
      floorWidth,
      floorDepth,
      maxHeight,
      minBoxSize,
      maxBoxSize,
      minCylSize,
      maxCylSize,
    )

    return {
      session,
      scene,
    }
  },
})

function Home() {
  const router = useRouter()
  const { scene, session } = Route.useLoaderData()

  const { user } = session

  return (
    <div className="w-full h-full">
      <div>
        <Button
          type="button"
          onClick={() => {
            router.invalidate()
          }}
        >
          Regenerate
        </Button>
        {user ? (
          <>
            <span>Welcome, {user.name ?? "User"}</span>
            <form method="POST" action="/api/auth/logout">
              <Button
                type="submit"
                className="w-fit"
                variant="destructive"
                size="lg"
              >
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <form method="GET" className="flex flex-col gap-2">
            <Button
              formAction="/api/auth/discord"
              type="submit"
              variant="outline"
              size="sm"
            >
              Sign in with Discord
            </Button>
          </form>
        )}
      </div>
      <Scene scene={scene} />
    </div>
  )
}

import {createFileRoute, useRouter} from "@tanstack/react-router"

import {getRandomObjects, Scene} from "@/features/scene/components/Scene"
import {Button} from "@/ui/components/button"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => getRandomObjects(),
})

function Home() {
  const router = useRouter()
  const objects = Route.useLoaderData()

  return (
    <div className="w-screen h-screen">
      <Button
        onClick={() => {
          router.invalidate()
        }}
      >
        Regenerate
      </Button>
      <Scene objects={objects} />
    </div>
  )
}

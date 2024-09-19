import {createFileRoute, useRouter} from "@tanstack/react-router"

import {getRandomObjects, Scene} from "@/features/scene/components/Scene"
import {Button} from "@/ui/components/button"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({context: {session}}) => {
    const objects = getRandomObjects()

    return {
      session,
      objects,
    }
  },
})

function Home() {
  const router = useRouter()
  const {objects, session} = Route.useLoaderData()

  return (
    <div className="w-screen h-screen">
      <div>
        <Button
          onClick={() => {
            router.invalidate()
          }}
        >
          Regenerate
        </Button>
        <pre>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      <Scene objects={objects} />
    </div>
  )
}

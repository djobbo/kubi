import { createFileRoute, useRouter } from "@tanstack/react-router"
import { getRandomObjects, Scene } from "@/features/scene/components/Scene"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => getRandomObjects(),
})

function Home() {
  const router = useRouter()
  const objects = Route.useLoaderData()

  return (
    <div className="w-screen h-screen">
      <button
        onClick={() => {
          router.invalidate()
        }}
      >
        Regenerate
      </button>
      <Scene objects={objects} />
    </div>
  )
}

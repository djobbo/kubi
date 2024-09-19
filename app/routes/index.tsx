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

  const {user} = session

  return (
    <div className="w-screen h-screen">
      <div>
        <Button
          type='button'
          onClick={() => {
            router.invalidate()
          }}
        >
          Regenerate
        </Button>
        {user ? (
          <>
            <span>Welcome, {user.name ?? "User"}</span>
            <Button
              type='button'
              formMethod='POST' formAction='/api/auth/logout' className="w-fit" variant="destructive" size="lg">
              Sign out
            </Button>
          </>
        ): (
          <Button
            type='button'
            formAction="/api/auth/discord" variant="outline" size="lg">
            Sign in with Discord
          </Button>
        )}
      </div>
      <Scene objects={objects} />
    </div>
  )
}

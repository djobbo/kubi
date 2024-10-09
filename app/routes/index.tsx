import { t, Trans } from "@lingui/macro"
import { createFileRoute, useRouter } from "@tanstack/react-router"

import { Scene } from "@/features/scene/components/Scene"
import { generateScene } from "@/features/scene/helpers/generateScene"
import { Button } from "@/ui/components/button"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context: { session } }) => {
    const scene = generateScene(5)

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
          <Trans>Regenerate</Trans>
        </Button>
        {user ? (
          <>
            {/* <span>Welcome, {user.name ?? "User"}</span> */}
            <span>
              <Trans>Welcome, {user.name ?? t`User`}</Trans>
            </span>
            <form method="POST" action="/api/auth/logout">
              <Button
                type="submit"
                className="w-fit"
                variant="destructive"
                size="lg"
              >
                <Trans>Sign out</Trans>
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
              <Trans>Sign in with Discord</Trans>
            </Button>
          </form>
        )}
      </div>
      <Scene scene={scene} />
    </div>
  )
}

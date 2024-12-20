import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute, useRouter } from "@tanstack/react-router"

import { Button } from "@/ui/components/button"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context: { session } }) => {
    return {
      session,
    }
  },
})

function Home() {
  const router = useRouter()
  const { session } = Route.useLoaderData()

  const { user } = session
  const username = user?.name ?? t`User`

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
            <span>
              <Trans>Welcome, {username}</Trans>
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
    </div>
  )
}

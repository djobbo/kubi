import { Trans } from "@lingui/macro"
import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router"

import { Button } from "@/ui/components/button"

export const DefaultCatchBoundary = ({ error }: ErrorComponentProps) => {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  // eslint-disable-next-line no-console
  console.error(error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          type="button"
          onClick={() => {
            router.invalidate()
          }}
        >
          <Trans>Try Again</Trans>
        </Button>
        {isRoot ? (
          <Button asChild variant="secondary">
            <Link to="/">
              <Trans>Home</Trans>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              <Trans>Go back</Trans>
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

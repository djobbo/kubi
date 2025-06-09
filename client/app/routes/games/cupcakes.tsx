import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { CupcakeButton } from "@/features/games/cupcakes/components/CupcakeButton"
import { CupcakeItems } from "@/features/games/cupcakes/components/CupcakeItems"
import cupcakesStyles from "@/features/games/cupcakes/cupcakes.css?url"
import { useCupcakesStore } from "@/features/games/cupcakes/store"
import { seo } from "@/helpers/seo"

export const Route = createFileRoute("/games/cupcakes")({
  component: RouteComponent,
  head: () => {
    return {
      meta: [
        ...seo({
          title: t`Cassidy's Cupcakes • Corehalla`,
          description: t`Cassidy's Cupcakes • Corehalla`,
          image: "/assets/images/og/main-og.jpg",
        }),
      ],
      links: [{ rel: "stylesheet", href: cupcakesStyles }],
    }
  },
})

function RouteComponent() {
  const { cupcakes, onInterval } = useCupcakesStore()

  useEffect(() => {
    const interval = setInterval(() => {
      onInterval(100)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const formattedCupcakes = cupcakes.toFixed(0)

  return (
    <div className="bg-gradient-to-b from-[#FD74C2] via-[#FFFCAF] to-[#FD74C2] p-4 rounded-xl">
      <h1>
        <Trans>Cassidy's Cupcakes</Trans>
      </h1>
      <p>
        <Trans>
          You have{" "}
          <span className="text-4xl font-bold">{formattedCupcakes}</span>{" "}
          cupcakes
        </Trans>
      </p>
      <div className="flex items-center justify-center">
        <CupcakeButton />
      </div>
      <CupcakeItems />
    </div>
  )
}

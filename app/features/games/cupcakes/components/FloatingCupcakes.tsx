import { t } from "@lingui/core/macro"

import { Image } from "@/features/brawlhalla/components/Image"

import { FLOATING_CUPCAKE_SPEED_MULTIPLIER } from "../contants"
import { useCupcakesStore } from "../store"

export const FloatingCupcakes = () => {
  const { floatingCupcakes } = useCupcakesStore()

  return floatingCupcakes.map((cupcake) => (
    <div
      key={cupcake.id}
      className="absolute pointer-events-none text-amber-600 font-bold animate-cupcake-float flex flex-col items-center justify-center"
      style={{
        left: `${cupcake.position.x}px`,
        top: `${cupcake.position.y}px`,
        "--direction-x": `${cupcake.direction.x * FLOATING_CUPCAKE_SPEED_MULTIPLIER}px`,
        "--direction-y": `${cupcake.direction.y * FLOATING_CUPCAKE_SPEED_MULTIPLIER}px`,
      }}
    >
      +{cupcake.value}
      <Image
        src="/assets/images/games/cupcakes/cupcake.svg"
        alt={t`Cupcake`}
        containerClassName="w-6 h-6"
        className="object-contain object-center"
      />
    </div>
  ))
}

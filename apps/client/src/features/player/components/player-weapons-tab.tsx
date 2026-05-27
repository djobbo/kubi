import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"

import { WeaponCard } from "./weapon-card"

type PlayerWeaponsTabProps = {
  weapons: (typeof Player.Type)["weapons"]
  matchtime: number
  games: number
}

export const PlayerWeaponsTab = ({
  weapons,
  matchtime,
  games,
}: PlayerWeaponsTabProps) => {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {weapons.map((weapon, index) => (
        <WeaponCard
          key={weapon.name}
          weapon={weapon}
          matchtime={matchtime}
          games={games}
          rank={index + 1}
        />
      ))}
    </div>
  )
}

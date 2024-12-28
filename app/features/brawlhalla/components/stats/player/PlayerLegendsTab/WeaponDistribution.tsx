import { t } from "@lingui/core/macro"
import type { FullLegend } from "bhapi/legends"

import { Card } from "@/components/base/Card"
import { Image, WeaponIcon } from "@/features/brawlhalla/components/Image"
import { formatTime } from "@/helpers/date"

import { CollapsibleSection } from "../../../layout/CollapsibleSection"
import { MiscStatGroup } from "../../MiscStatGroup"

interface PlayerLegendWeaponDistributionProps {
  legend: FullLegend
}

export const PlayerLegendWeaponDistribution = ({
  legend,
}: PlayerLegendWeaponDistributionProps) => {
  const weaponOne = {
    weapon: legend.weapon_one,
    kos: legend.stats?.koweaponone ?? 0,
    damage: parseInt(legend.stats?.damageweaponone ?? "0"),
    timeheld: legend.stats?.timeheldweaponone ?? 0,
  } as const

  const weaponTwo = {
    weapon: legend.weapon_two,
    kos: legend.stats?.koweapontwo ?? 0,
    damage: parseInt(legend.stats?.damageweapontwo ?? "0"),
    timeheld: legend.stats?.timeheldweapontwo ?? 0,
  } as const

  const unarmed = {
    weapon: t`Unarmed`,
    kos: legend.stats?.kounarmed ?? 0,
    damage: parseInt(legend.stats?.damageunarmed ?? "0"),
    timeheld: legend.stats
      ? legend.stats.matchtime -
        legend.stats.timeheldweaponone -
        legend.stats.timeheldweapontwo
      : 0,
  }

  return (
    <CollapsibleSection trigger={t`Weapon Distribution`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[weaponOne, weaponTwo, unarmed].map((weapon) => (
          <Card
            key={weapon.weapon}
            title={
              <span className="flex gap-2 items-center">
                <WeaponIcon
                  weapon={weapon.weapon}
                  alt={weapon.weapon}
                  Container="span"
                  containerClassName="block w-6 h-6"
                  className="object-contain object-center"
                />
                {weapon.weapon}
              </span>
            }
          >
            <MiscStatGroup
              gapClassName="gap-1"
              column
              stats={[
                {
                  name: t`KOs`,
                  value: (
                    <>
                      {weapon.kos}{" "}
                      <span className="text-xs text-textVar1">
                        (
                        {legend.stats
                          ? `${((weapon.kos / legend.stats?.kos) * 100).toFixed(
                              2,
                            )}%`
                          : "0%"}
                        )
                      </span>
                    </>
                  ),
                  desc: t`Kills with this weapon`,
                },
                {
                  name: t`Damage dealt`,
                  value: (
                    <>
                      {weapon.damage}{" "}
                      <span className="text-xs text-textVar1">
                        (
                        {legend.stats
                          ? `${(
                              (weapon.damage /
                                parseInt(legend.stats.damagedealt)) *
                              100
                            ).toFixed(2)}%`
                          : "0%"}
                        )
                      </span>
                    </>
                  ),
                  desc: t`Damage dealt with this weapon`,
                },
                {
                  name: t`Time held`,
                  value: (
                    <>
                      {formatTime(weapon.timeheld)}{" "}
                      <span className="text-xs text-textVar1">
                        (
                        {legend.stats
                          ? `${(
                              (weapon.timeheld / legend.stats?.matchtime) *
                              100
                            ).toFixed(2)}%`
                          : "0%"}
                        )
                      </span>
                    </>
                  ),
                  desc: t`Time held with this weapon`,
                },
                {
                  name: t`DPS`,
                  value: `${(weapon.damage / weapon.timeheld).toFixed(
                    1,
                  )} dmg/s`,
                  desc: t`Damage dealt per second with this ${weapon.weapon}`,
                },
                {
                  name: t`Time to kill`,
                  value: `${(weapon.timeheld / weapon.kos).toFixed(1)}s`,
                  desc: t`Time between each kill in seconds`,
                },
              ]}
            />
          </Card>
        ))}
      </div>
      <MiscStatGroup
        className="mt-4"
        stats={[
          {
            name: t`Throw KOs`,
            value: legend.stats ? (
              <>
                {legend.stats.kothrownitem}{" "}
                <span className="text-xs text-textVar1">
                  (
                  {(
                    (legend.stats.kothrownitem / legend.stats.kos) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </>
            ) : (
              "0 (0%)"
            ),
            desc: t`Kills with thrown items`,
          },
          {
            name: t`Throw damage`,
            value: legend.stats ? (
              <>
                {legend.stats.damagethrownitem}{" "}
                <span className="text-xs text-textVar1">
                  (
                  {(
                    (parseInt(legend.stats.damagethrownitem) /
                      parseInt(legend.stats.damagedealt)) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </>
            ) : (
              "0 (0%)"
            ),
            desc: t`Damage dealt with thrown items`,
          },
          {
            name: t`Gadgets KOs`,
            value: legend.stats ? (
              <>
                {legend.stats.kogadgets}{" "}
                <span className="text-xs text-textVar1">
                  (
                  {((legend.stats.kogadgets / legend.stats.kos) * 100).toFixed(
                    2,
                  )}
                  %)
                </span>
              </>
            ) : (
              "0 (0%)"
            ),
            desc: t`Kills with gadgets`,
          },
          {
            name: t`Gadgets damage`,
            value: legend.stats ? (
              <>
                {legend.stats.damagegadgets}{" "}
                <span className="text-xs text-textVar1">
                  (
                  {(
                    (parseInt(legend.stats.damagegadgets) /
                      parseInt(legend.stats.damagedealt)) *
                    100
                  ).toFixed(2)}
                  %)
                </span>
              </>
            ) : (
              "0 (0%)"
            ),
            desc: t`Damage dealt with gadgets`,
          },
        ]}
      />
    </CollapsibleSection>
  )
}

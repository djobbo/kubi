import { StatGrid } from "@/shared/components/stat-grid"
import type { Player } from "@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id"
import { cn } from "@dair/common/src/helpers/ui"
import { t } from "@lingui/core/macro"
import { Select } from "@base-ui-components/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { LegendCard } from "./legend-card"

type PlayerLegendsTabProps = {
  legends: (typeof Player.Type)["legends"]
  matchtime: number
  games: number
}

export const PlayerLegendsTab = ({
  legends,
  matchtime,
  games,
}: PlayerLegendsTabProps) => {
  const weaponOptions = useMemo(() => {
    const names = new Set<string>()
    for (const legend of legends) {
      names.add(legend.weapon_one.name)
      names.add(legend.weapon_two.name)
    }
    return [
      { label: t`All weapons`, value: "" },
      ...[...names].sort().map((name) => ({ label: name, value: name })),
    ]
  }, [legends])

  const [weaponFilter, setWeaponFilter] = useState("")

  const filteredLegends = useMemo(
    () =>
      legends.filter(
        (legend) =>
          !weaponFilter ||
          legend.weapon_one.name === weaponFilter ||
          legend.weapon_two.name === weaponFilter,
      ),
    [legends, weaponFilter],
  )

  const playedCount = filteredLegends.filter(
    (legend) => legend.stats.matchtime > 0,
  ).length

  return (
    <>
      <Select.Root
        items={weaponOptions}
        value={weaponFilter}
        onValueChange={(value) => setWeaponFilter(value ?? "")}
      >
        <Select.Trigger
          className={cn(
            "mt-4 flex h-10 w-full max-w-xs items-center justify-between gap-3",
            "rounded-md border border-border bg-bg px-3.5",
          )}
        >
          <Select.Value className="text-sm">
            {weaponOptions.find(({ value }) => value === weaponFilter)?.label}
          </Select.Value>
          <Select.Icon className="flex">
            <ChevronDownIcon className="size-4" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="z-20 outline-none select-none"
            sideOffset={8}
          >
            <Select.Popup className="corner-smooth-md bg-bg-root outline-1 outline-border">
              <Select.List className="relative scroll-py-6 overflow-y-auto py-1">
                {weaponOptions.map(({ label, value }) => (
                  <Select.Item
                    key={value || "all"}
                    value={value}
                    className={cn(
                      "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
                      "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-bg-light",
                    )}
                  >
                    <Select.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-3" />
                    </Select.ItemIndicator>
                    <Select.ItemText className="col-start-2">
                      {label}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <StatGrid
        className="mt-6"
        stats={[
          {
            title: t`Legends played`,
            value: `${playedCount} / ${filteredLegends.length}`,
          },
          {
            title: t`Played in ranked`,
            value: `${
              filteredLegends.filter((l) => l.ranked && l.ranked.games > 0)
                .length
            } / ${filteredLegends.length}`,
          },
          {
            title: t`Total legends level`,
            value: filteredLegends
              .reduce((sum, l) => sum + l.stats.level, 0)
              .toLocaleString(),
          },
        ]}
      />
      <div className="mt-6 flex flex-col gap-4">
        {filteredLegends.map((legend, index) => (
          <LegendCard
            key={legend.id}
            legend={legend}
            matchtime={matchtime}
            games={games}
            rank={index + 1}
          />
        ))}
      </div>
    </>
  )
}

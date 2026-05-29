import { Dialog } from "@base-ui-components/react/dialog"
import * as Atom from "effect/unstable/reactivity/Atom"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react"
import { searchOpenAtom } from "../helpers/search-open-atom"
import { useEffect } from "react"
import * as searchCommandStyles from "./search-command.css"
import { ApiClient } from "@/shared/api-client"
import { Effect } from "effect"
import { Link } from "@tanstack/react-router"
import { ChevronDownIcon, SearchIcon, CheckIcon } from "lucide-react"
import { Select } from "@base-ui-components/react/select"
import { Input } from "@base-ui-components/react/input"
import { ScrollArea } from "@base-ui-components/react/scroll-area"
import { cn } from "@dair/common/src/helpers/ui"

const DEBOUNCE_TIME = 1000
const MIN_SEARCH_LENGTH = 1

const searchAtom = Atom.make("")
const searchResultAtom = ApiClient.runtime.atom((get) =>
  Effect.gen(function* () {
    const apiClient = yield* ApiClient
    const search = get(searchAtom)
    if (search.length < MIN_SEARCH_LENGTH) {
      return { data: [] }
    }

    yield* Effect.sleep(DEBOUNCE_TIME)

    return yield* apiClient.brawlhalla["search-player"]({
      query: { name: search },
    })
  }),
)

const categories = [
  { label: "Players", value: "players" },
  { label: "Guilds", value: "guilds" },
] as const

const searchCategoryAtom =
  Atom.make<(typeof categories)[number]["value"]>("players")

const CategorySelect = () => {
  const [searchCategory, setSearchCategory] = useAtom(searchCategoryAtom)

  return (
    <Select.Root
      items={categories}
      value={searchCategory}
      onValueChange={(value) =>
        setSearchCategory(value as (typeof categories)[number]["value"])
      }
    >
      <Select.Trigger
        className={cn(
          "flex h-10 min-w-24 items-center justify-between gap-3",
          "rounded-md pr-3 pl-3.5",
        )}
      >
        <Select.Value className="data-placeholder:opacity-60">
          {categories.find(({ value }) => value === searchCategory)?.label}
        </Select.Value>
        <Select.Icon className="flex">
          <ChevronDownIcon className="size-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="outline-none select-none z-10"
          sideOffset={8}
        >
          <Select.Popup className="bg-bg-root corner-smooth-md outline-1 outline-border">
            <Select.List className="relative py-1 scroll-py-6 overflow-y-auto">
              {categories.map(({ label, value }) => (
                <Select.Item
                  key={value}
                  value={value}
                  className={cn(
                    "grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm leading-4 outline-none select-none",
                    "group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4",
                    "data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50",
                    "data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900",
                    "pointer-coarse:py-2.5 pointer-coarse:text-[0.925rem]",
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
  )
}

const SearchInput = () => {
  const setSearch = useAtomSet(searchAtom)

  return (
    <label className="flex items-center gap-2 px-4 py-2">
      <SearchIcon className="w-4 h-4" />
      <CategorySelect />
      <Input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 h-8 p-2"
      />
    </label>
  )
}

const CategoryBadge = ({
  type,
}: {
  type: (typeof categories)[number]["value"]
}) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="text-sm text-gray-500">{type}</div>
    </div>
  )
}

const SearchResults = () => {
  const search = useAtomValue(searchAtom)
  const searchResult = useAtomValue(searchResultAtom)
  const results = AsyncResult.builder(searchResult)
    .onSuccess(({ data }) => data)
    .orElse(() => [])
    .filter((item) => item.name.toLowerCase().startsWith(search.toLowerCase()))

  if (search.length <= 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-2">
        Search must start with exact match of a player or clan name.
      </div>
    )
  }

  if (results.length <= 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-2">
        No results found
      </div>
    )
  }

  return results.map((item) => (
    <Link
      className="flex items-center gap-2 px-4 py-2"
      key={item.playerId}
      to="/{-$locale}/brawlhalla/players/$playerId/{-$tab}"
      params={{ playerId: item.playerId.toString(), tab: "overview" }}
    >
      {/* TODO: add clan type */}
      <CategoryBadge type="players" />
      <div>{item.name}</div>
    </Link>
  ))
}

export const SearchCommand = () => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return
      }

      event.preventDefault()
      setSearchOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setSearchOpen])

  return (
    <Dialog.Root open={searchOpen} onOpenChange={(open) => setSearchOpen(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={searchCommandStyles.backdrop} />
        <Dialog.Popup
          className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl -mt-8",
            "corner-smooth-md outline-1 outline-bg-light bg-bg-root/90 transition-all 150ms",
          )}
        >
          <SearchInput />
          <hr className="border-border" />
          <ScrollArea.Root className="h-auto max-h-[calc(100vh-8rem)] w-full">
            <ScrollArea.Viewport className="flex flex-col gap-2 p-2">
              <SearchResults />
            </ScrollArea.Viewport>
          </ScrollArea.Root>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

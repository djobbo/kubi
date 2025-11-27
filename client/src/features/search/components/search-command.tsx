import { Dialog } from "@base-ui-components/react/dialog"
import { Atom, Result, useAtom, useAtomValue } from "@effect-atom/atom-react"
import { searchOpenAtom } from "../helpers/search-open-atom"
import * as searchCommandStyles from "./search-command.css"
import { Autocomplete } from "@base-ui-components/react/autocomplete"
import { ApiClient } from "@/shared/api-client"
import { Effect } from "effect"

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

    return yield* apiClient.brawlhalla["get-rankings-1v1"]({
      path: { region: "all", page: 1 },
      urlParams: { name: search },
    })
  }),
)

const SearchAutocomplete = () => {
  const [search, setSearch] = useAtom(searchAtom)
  const searchResult = useAtomValue(searchResultAtom)

  const results = Result.builder(searchResult)
    .onSuccess(({ data }) => data)
    .orElse(() => [])
    .filter((item) => item.name.toLowerCase().startsWith(search.toLowerCase()))

  return (
    <Autocomplete.Root items={results}>
      <label>
        Search tags
        <Autocomplete.Input
          placeholder="e.g. brawl"
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4}>
          <Autocomplete.Popup>
            <Autocomplete.Empty>No tags found.</Autocomplete.Empty>
            <Autocomplete.List>
              {results.map((item) => (
                <Autocomplete.Item key={item.id} value={item}>
                  {item.name}
                </Autocomplete.Item>
              ))}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

export const SearchCommand = () => {
  const [searchOpen, setSearchOpen] = useAtom(searchOpenAtom)

  return (
    <Dialog.Root open={searchOpen} onOpenChange={(open) => setSearchOpen(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={searchCommandStyles.backdrop} />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-full -mt-8 p-4 corner-md outline-1 outline-gray-200 bg-gray-50 text-gray-900 transition-all 150ms">
          <Dialog.Title>Notifications</Dialog.Title>
          <Dialog.Description>
            You are all caught up. Good job!
          </Dialog.Description>
          <SearchAutocomplete />
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

import { Button } from "@/shared/components/button"
import { useAtomSet } from "@effect-atom/atom-react"
import { searchOpenAtom } from "../helpers/search-open-atom"

export const SearchButton = () => {
  const setSearchOpen = useAtomSet(searchOpenAtom)

  return <Button onClick={() => setSearchOpen(true)}>Search</Button>
}

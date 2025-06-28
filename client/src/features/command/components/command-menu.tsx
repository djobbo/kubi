import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/ui/components/command"
import { useEffect, useState } from 'react'
import { Button } from '@/ui/components/button'
import { useRootContext } from "@/hooks/use-root-context"
import { useDebouncedState } from "@/hooks/useDebouncedState"
import { useQuery, queryOptions } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

export const usePlayerSearch = (name: string, enabled: boolean) => {
	const { apiClient } = useRootContext()

	return useQuery(
		queryOptions({
			queryKey: ["player-search", name],
			queryFn: async () => {
				const searchRes = await apiClient.brawlhalla
					.searchPlayer({
						query: {
							name,
						},
					})
					
					if (!searchRes.ok) {
						throw new Error("Failed to search for player")
					}

					const search = await searchRes.json()

				return search.data
			},
			enabled,
		}),
	)
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [search, setSearch, immediateSearch, isDebouncingSearch] =
		useDebouncedState("", 250)
	const navigate = useNavigate()

const enableSearch = search.length > 2 && open
const playerSearchQuery = usePlayerSearch(search, enableSearch)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== "/") return
		e.preventDefault()
		setOpen((open) => !open)
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  console.log(playerSearchQuery.data)

  return (
    <>
	  <Button
			variant="outline"
		className='w-48 justify-between'
		onClick={() => setOpen(true)}
	>
		<span className="hidden lg:inline-flex">Search...</span>
		<span className="inline-flex lg:hidden">Search...</span>
		<CommandShortcut>/</CommandShortcut>
	</Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." onValueChange={setSearch} value={immediateSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
		  {playerSearchQuery.data && playerSearchQuery.data.length > 0 && <CommandGroup heading="Players">
		  {playerSearchQuery.data?.map((player) => (
				<CommandItem
				key={player.playerId}
				value={player.playerId}
				keywords={player.aliases.map((alias) => alias.alias)}
				onSelect={() => {
					setOpen(false)
					navigate({ to: `/players/${player.playerId}` })
				}}
			>
				<User className="mr-2 h-4 w-4" />
				{player.aliases[0].alias}
			</CommandItem>
		  ))}
		  </CommandGroup>}
        </CommandList>
      </CommandDialog>
    </>
  )
}

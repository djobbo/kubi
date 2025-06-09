import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { type DialogProps } from "@radix-ui/react-dialog"
import { useRouter } from "@tanstack/react-router"
import { FileIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/ui/components/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/ui/components/command"
import { cn } from "@/ui/lib/utils"

interface CommandMenuProps extends DialogProps {
  title?: string
  titleShort?: string
  keyboardShortcut?: boolean
}

export const CommandMenu = ({
  title = t`Search...`,
  titleShort = t`Search...`,
  keyboardShortcut = false,
  ...props
}: CommandMenuProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!keyboardShortcut) return

    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [keyboardShortcut])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">{title}</span>
        <span className="inline-flex lg:hidden">{titleShort}</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>
          <Trans>K</Trans>
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t`Type a command or search...`} />
        <CommandList>
          <CommandEmpty>
            <Trans>No results found.</Trans>
          </CommandEmpty>
          <CommandGroup heading={t`Links`}>
            <CommandItem
              value="hello"
              onSelect={() => {
                runCommand(() => router.navigate({ to: "/" }))
              }}
            >
              <FileIcon className="mr-2 h-4 w-4" />
              <Trans>Hello World</Trans>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  )
}

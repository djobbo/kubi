import { Trans } from "@lingui/react/macro"
import { Link, useRouter } from "@tanstack/react-router"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useState } from "react"

import { Logo } from "@/components/layout/Logo"
import { navConfig } from "@/config/nav"
import { siteConfig } from "@/config/site"
import { Button } from "@/ui/components/button"
import { ScrollArea } from "@/ui/components/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/ui/components/sheet"
import { cn } from "@/ui/lib/utils"

export function MobileNav() {
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
				>
					<svg
						strokeWidth="1.5"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
					>
						<title>Menu</title>
						<path
							d="M3 5H11"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M3 12H16"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M3 19H21"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span className="sr-only">
						<Trans>Toggle Menu</Trans>
					</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="pr-0">
				<MobileLink to="/" className="flex items-center" onOpenChange={setOpen}>
					<Logo className="mr-2 h-4 w-4" />
					<span className="font-bold">{siteConfig.title}</span>
				</MobileLink>
				<ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
					<div className="flex flex-col space-y-3">
						{navConfig().main.map((link) => (
							<MobileLink key={link.to} to={link.to} onOpenChange={setOpen}>
								{link.title}
							</MobileLink>
						))}
					</div>
					<div className="flex flex-col space-y-2">
						{/* {navConfig().sidebar.map((link, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-6">
                <h4 className="font-medium">{link.title}</h4>
                {link.items?.map((item) => (
                  <MobileLink
                    key={item.to}
                    to={item.to}
                    onOpenChange={setOpen}
                    className="text-muted-foreground"
                  >
                    {item.title}
                  </MobileLink>
                ))}
              </div>
            ))} */}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	)
}

interface MobileLinkProps extends ComponentPropsWithoutRef<typeof Link> {
	onOpenChange?: (open: boolean) => void
	children: ReactNode
	className?: string
}

function MobileLink({
	to,
	onOpenChange,
	className,
	children,
	...props
}: MobileLinkProps) {
	const router = useRouter()

	return (
		<Link
			onClick={() => {
				router.navigate({ to })
				onOpenChange?.(false)
			}}
			className={cn(className)}
			{...props}
		>
			{children}
		</Link>
	)
}

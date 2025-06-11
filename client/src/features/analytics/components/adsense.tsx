import { useRouter } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/ui/lib/utils"

import { adsenseCaPub } from "../helpers/gtag"

declare global {
	interface Window {
		adsbygoogle: Record<string, unknown>[]
	}
}

interface AdsenseProps {
	slot: string
	format?: string
	layout?: string
	layoutKey?: string
	responsive?: boolean
	className?: string
}

const Ads = ({
	slot,
	// format = "auto",
	layout = "",
	layoutKey = "",
	// responsive = false,
	className = "",
}: AdsenseProps) => {
	const adsRef = useRef<HTMLModElement | null>(null)

	useEffect(() => {
		if (typeof window === "undefined") return

		const executeWindowAds = () => {
			window.adsbygoogle = window.adsbygoogle || []
			window.adsbygoogle.push({})
		}

		const insHasChildren = adsRef.current?.childNodes.length
		if (!insHasChildren) {
			executeWindowAds()
		}
	}, [])

	return (
		<ins
			ref={adsRef}
			className={cn("adsbygoogle", className)}
			data-ad-client={adsenseCaPub}
			data-ad-slot={slot}
			data-ad-layout={layout}
			data-ad-layout-key={layoutKey}
			// data-ad-format={format}
			// data-full-width-responsive={responsive}
		></ins>
	)
}

const Adsense = (props: AdsenseProps) => {
	const router = useRouter()
	const [shouldMount, setShouldMount] = useState(true)

	useEffect(() => {
		const onBeforeLoadUnsubscribe = router.subscribe(
			"onBeforeLoad",
			({ pathChanged }) => {
				if (!pathChanged) return

				setShouldMount(false)
			},
		)
		const onLoadUnsubscribe = router.subscribe("onLoad", () => {
			setShouldMount(true)
		})

		return () => {
			onBeforeLoadUnsubscribe()
			onLoadUnsubscribe()
		}
	}, [])

	return shouldMount ? <Ads {...props} /> : null
}

export const AdsenseStatsHeader = () => {
	return (
		<Adsense slot="8570143014" responsive className="block w-full h-full" />
	)
}

import { Suspense, lazy } from "react"

const ToasterComponent = lazy(() =>
	// Lazy load in development
	import("react-hot-toast").then((res) => ({
		default: res.Toaster,
	})),
)

export function Toaster() {
	return (
		<Suspense>
			<ToasterComponent />
		</Suspense>
	)
}

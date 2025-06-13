import type { Provider } from '@dair/schema'
import { useRootContext } from './use-root-context'

export const useSession = () => {
	const { session, apiClient } = useRootContext()

	const logIn = (provider: Provider) => {
		const url = apiClient.auth.getLoginUrl(provider)
		window.location.href = url.toString()
	}

	return {
		isLoggedIn: !!session,
		session,
		logIn,
		logInWithDiscord: () => logIn("discord"),
		logInWithGoogle: () => logIn("google"),
		logOut: () => {
			apiClient.auth.logout()
		}
	}
}
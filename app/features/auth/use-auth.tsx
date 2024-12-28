import { useLoaderData, useNavigate } from "@tanstack/react-router"

export const useAuth = () => {
  const loader = useLoaderData({ from: "__root__" })

  const navigate = useNavigate()

  return {
    ...loader.session,
    isLoggedIn: !!loader.session,
    signIn: () => {},
    signOut: () => {
      // TODO: Implement sign out
      throw new Error("Not implemented")
    },
  }
}

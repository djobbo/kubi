import { useLoaderData } from "@tanstack/react-router"

export const useAuth = () => {
  const loader = useLoaderData({ from: "__root__" })
  return {
    ...loader.session,
    isLoggedIn: !!loader.session,
    signIn: () => {
      // TODO: "Implement sign in"
      throw new Error("Not implemented")
    },
    signOut: () => {
      // TODO: Implement sign out
      throw new Error("Not implemented")
    },
  }
}

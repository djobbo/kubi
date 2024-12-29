import { useNavigate } from "@tanstack/react-router"

import { Route } from "@/routes/__root"

export const useAuth = () => {
  const loader = Route.useLoaderData()

  // const navigate = useNavigate()

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

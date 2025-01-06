import { submitForm } from "@/helpers/submit-form"
import { useRootContext } from "@/hooks/useRootContext"
import type { APIRoute as discordAPIRoute } from "@/routes/api/auth/discord"
import type { APIRoute as logoutAPIRoute } from "@/routes/api/auth/logout"

export const useAuth = () => {
  const loader = useRootContext()

  return {
    ...loader.session,
    isLoggedIn: !!loader.session?.user,
    logIn: () =>
      submitForm(
        "GET",
        "/api/auth/discord" satisfies (typeof discordAPIRoute)["path"],
      ),
    logOut: () => {
      submitForm(
        "POST",
        "/api/auth/logout" satisfies (typeof logoutAPIRoute)["path"],
      )
    },
  }
}

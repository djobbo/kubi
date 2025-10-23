import { Effect } from "effect";
import { Authorization } from "../../../services/authorization";

export const deleteSession = Effect.fn(function* () {
  const authorizationService = yield* Authorization;
  yield* authorizationService.deleteSession();

  return {
    data: {
      message: "Session deleted successfully",
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
});

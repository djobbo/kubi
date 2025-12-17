import { Schema } from "effect"

export class WorkerSuccessResponse extends Schema.TaggedError<WorkerSuccessResponse>()(
  "WorkerSuccessResponse",
  {
    message: Schema.String,
  },
) {}

import { Schema } from 'effect';

export const State = Schema.Struct({
	path: Schema.UndefinedOr(Schema.String),
	baseUrl: Schema.UndefinedOr(Schema.String),
})

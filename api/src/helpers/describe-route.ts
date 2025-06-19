import { zValidator } from "@hono/zod-validator"
import type { MiddlewareHandler } from "hono"
import {
	type DescribeRouteOptions,
	describeRoute as describeOpenApiRoute,
} from "hono-openapi"
import { uniqueSymbol as openApiSpecsSymbol } from "hono-openapi"
import { resolver } from "hono-openapi/zod"
import type { ContentlessStatusCode, StatusCode } from "hono/utils/http-status"
import { z } from "zod"

interface DescribeRouteExtendedOptions<
	TQuery extends Record<
		string,
		{ required: boolean; schema: z.ZodType }
	> = Record<StatusCode, { required: boolean; schema: z.ZodType }>,
	TResponses extends RouteResponses = RouteResponses,
	TContentless extends RouteContentless = RouteContentless,
> extends Omit<DescribeRouteOptions, "responses" | "query"> {
	query?: TQuery
	responses?: TResponses
	contentless?: TContentless
}

type RouteResponses = Partial<
	Record<StatusCode, { description: string; schema: z.ZodType }>
>

type RouteContentless = Partial<
	Record<ContentlessStatusCode, { description: string }>
>

export const describeRoute = <
	TQuery extends Record<
		string,
		{ required: boolean; schema: z.ZodType }
	> = Record<string, { required: boolean; schema: z.ZodType }>,
	TResponses extends RouteResponses = RouteResponses,
	TContentless extends RouteContentless = RouteContentless,
>(
	specs: DescribeRouteExtendedOptions<TQuery, TResponses, TContentless>,
) => {
	const openApiSpecs = describeOpenApiRoute({
		...specs,
		responses: {
			...Object.fromEntries(
				Object.entries(specs.responses ?? {}).map(
					([code, { description, schema }]) => [
						code,
						{
							description,
							content: {
								"application/json": {
									schema: resolver(schema),
								},
							},
						},
					],
				),
			),
			...Object.fromEntries(
				Object.entries(specs.contentless ?? {}).map(
					([code, { description }]) => [code, { description, content: {} }],
				) ?? [],
			),
		},
		parameters: [
			...(specs.parameters ?? []),
			...Object.entries(specs.query ?? {}).map(
				([name, { required, schema }]) => ({
					name,
					in: "query",
					required,
					schema: resolver(schema),
				}),
			),
		],
	})

	const querySchema = z.object({
		...(Object.fromEntries(
			Object.entries(specs.query ?? {}).map(([name, { schema }]) => [
				name,
				schema,
			]),
		) as { [K in keyof TQuery]: TQuery[K]["schema"] }),
	})

	const queryValidator = zValidator("query", querySchema)

	const middleware: MiddlewareHandler<
		any,
		string,
		typeof queryValidator extends MiddlewareHandler<any, string, infer Input>
			? Input & {
					json: {
						[K in keyof TResponses]: TResponses[K] extends {
							schema: infer Schema extends z.ZodType
						}
							? z.infer<Schema>
							: never
					}
					status: keyof TContentless extends ContentlessStatusCode
						? keyof TContentless
						: never
				}
			: never
	> = async (c, next) => {
		return openApiSpecs(c, async () => {
			console.log("openApiSpecs")
			return queryValidator(c, async () => {
				console.log("queryValidator")
				return next()
			})
		})
	}

	return Object.assign(middleware, {
		[openApiSpecsSymbol]: openApiSpecs[openApiSpecsSymbol],
	})
}

export const queryParam = <TSchema extends z.ZodType>(
	schema: TSchema,
	options: { required?: boolean } = {},
) => {
	return {
		required: options.required ?? true,
		schema,
	}
}

export const jsonResponse = <TSchema extends z.ZodType>(
	description: string,
	schema: TSchema,
) => {
	return {
		description,
		schema,
	}
}

export const contentlessResponse = (description: string) => {
	return {
		description,
	}
}

export const jsonErrorResponse = <TCode extends readonly [string, ...string[]]>(
	description: string,
	codes: TCode,
) => {
	return jsonResponse(
		description,
		z.object({
			error: z.object({
				code: z.enum(codes),
				message: z.string(),
				details: z.array(z.string()).optional(),
			}),
		}),
	)
}

import z from "zod"

const authorSchema = z.object({
	name: z.string(),
})

const categorySchema = z.object({
	name: z.string(),
	slug: z.string(),
})

const imageSizeSchema = z.object({
	name: z.string(),
	mimeType: z.string(),
	sourceUrl: z.string(),
	width: z.coerce.number(),
	height: z.coerce.number(),
})

const featuredImageSchema = z.object({
	sourceUrl: z.string(),
	mediaDetails: z.object({
		height: z.number(),
		width: z.number(),
		sizes: z.array(imageSizeSchema),
	}),
})

export const articleSchema = z
	.object({
		title: z.string(),
		slug: z.string(),
		dateGmt: z.string(),
		excerpt: z.string(),
		content: z.string().optional(),
		author: z.object({
			node: authorSchema,
		}),
		categories: z.object({
			nodes: z.array(categorySchema),
		}),
		featuredImage: z.object({
			node: featuredImageSchema,
		}),
	})
	.transform((data) => ({
		...data,
		featuredImage: {
			...data.featuredImage,
			sourceUrl: data.featuredImage.node.sourceUrl,
		},
		categories: data.categories.nodes,
	}))

export const articlesSchema = z.object({
	posts: z.object({
		pageInfo: z.object({
			endCursor: z.string().nullable(),
		}),
		nodes: z.array(articleSchema),
	}),
})

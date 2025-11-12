type SEOProps = {
	title: string
	description?: string
	image?: string
	keywords?: string
}

export const seo = ({ title, description, keywords, image }: SEOProps) => {
	const tags = [
		{ tag: "title", content: title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:creator", content: "@corehalla" },
		{ name: "twitter:site", content: "@corehalla" },
		{ name: "og:type", content: "website" },
		{ name: "og:title", content: title },
		{ name: "og:description", content: description },
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "twitter:card", content: "summary_large_image" },
					{ name: "og:image", content: image },
				]
			: []),
	]

	return tags
}

export const SEO = (props: SEOProps) => {
	const meta = seo(props)

	return meta.map((tag) => {
		switch (tag.tag) {
			case "title":
				return <title key="title">{tag.content}</title>
			default:
				return <meta key={tag.name} {...tag} />
		}
	})
}

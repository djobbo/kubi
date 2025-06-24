export const sluggify = (str: string) => {
	return encodeURIComponent(
		str
			.toLowerCase()
			.replace(/ /g, "-")
			.replace(/[^a-z0-9-]/g, ""),
	)
}

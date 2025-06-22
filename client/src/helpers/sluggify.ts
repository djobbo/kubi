export const sluggify = (str: string) => {
	return encodeURIComponent(str.toLowerCase().replace(/ /g, "-"))
}

export const gql = (
	strings: TemplateStringsArray,
	...values: any[]
): string => {
	const query = strings.reduce((result, str, i) => {
		return result + str + (values[i] !== undefined ? values[i] : "")
	}, "")

	return query
		.split("\n")
		.filter((line) => line.length > 0)
		.join("\n")
}

export const submitForm = async (method: string, action: string) => {
	const form = document.createElement("form")
	form.method = method
	form.action = action
	document.body.appendChild(form)
	form.submit()
	document.body.removeChild(form)
}

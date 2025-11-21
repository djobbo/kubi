export function cleanString(originalString: string) {
  try {
    return decodeURIComponent(escape(originalString))
  } catch {
    return originalString
  }
}

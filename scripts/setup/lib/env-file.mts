import { access, copyFile, readFile, writeFile } from "node:fs/promises"

export const ENV_PATH = ".env"
export const ENV_EXAMPLE_PATH = ".env.example"

type EnvRawEntry = { readonly type: "raw"; readonly line: string }
type EnvVarEntry = {
  readonly type: "var"
  readonly key: string
  value: string
  readonly line: string
}
type EnvEntry = EnvRawEntry | EnvVarEntry

export const parseEnvFile = (content: string): Array<EnvEntry> => {
  const entries: Array<EnvEntry> = []
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      entries.push({ type: "raw", line })
      continue
    }
    const eq = trimmed.indexOf("=")
    if (eq === -1) {
      entries.push({ type: "raw", line })
      continue
    }
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    entries.push({ type: "var", key, value, line })
  }
  return entries
}

const serializeEnvFile = (entries: ReadonlyArray<EnvEntry>) =>
  entries
    .map((e) => (e.type === "raw" ? e.line : `${e.key}=${e.value}`))
    .join("\n")

export const getEnvVar = (content: string, key: string, fallback: string) => {
  for (const entry of parseEnvFile(content)) {
    if (entry.type === "var" && entry.key === key) return entry.value
  }
  return fallback
}

export const mergeEnvFile = (
  existingContent: string,
  updates: Record<string, string | undefined>,
) => {
  const entries = parseEnvFile(existingContent)
  const byKey = new Map<string, EnvVarEntry>()
  for (const e of entries) {
    if (e.type === "var") byKey.set(e.key, e)
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") continue
    const prev = byKey.get(key)
    if (prev) {
      prev.value = value
    } else {
      const entry: EnvVarEntry = {
        type: "var",
        key,
        value,
        line: `${key}=${value}`,
      }
      entries.push(entry)
      byKey.set(key, entry)
    }
  }
  return serializeEnvFile(entries)
}

export const ensureEnvFile = async () => {
  try {
    await access(ENV_PATH)
    return
  } catch {
    /* missing */
  }

  try {
    await access(ENV_EXAMPLE_PATH)
    await copyFile(ENV_EXAMPLE_PATH, ENV_PATH)
    console.log(`[setup] Created ${ENV_PATH} from ${ENV_EXAMPLE_PATH}`)
    return
  } catch {
    throw new Error(`Missing ${ENV_PATH} and ${ENV_EXAMPLE_PATH}`)
  }
}

export const writeEnvUpdates = async (
  updates: Record<string, string | undefined>,
) => {
  const existing = await readFile(ENV_PATH, "utf8")
  const merged = mergeEnvFile(existing, updates)
  await writeFile(ENV_PATH, merged.endsWith("\n") ? merged : `${merged}\n`)
}

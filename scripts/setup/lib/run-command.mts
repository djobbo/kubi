import { spawn } from "node:child_process"

export type RunCommandResult = {
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number
}

export type RunCommandOptions = {
  readonly cwd?: string
}

export const runCommand = (
  command: string,
  args: ReadonlyArray<string>,
  options: RunCommandOptions = {},
): Promise<RunCommandResult> =>
  new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    proc.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on("error", reject)
    proc.on("close", (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 })
    })
  })

export const runCommandOrThrow = async (
  command: string,
  args: ReadonlyArray<string>,
  options: RunCommandOptions = {},
): Promise<string> => {
  const { stdout, stderr, exitCode } = await runCommand(command, args, options)
  if (exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with ${exitCode}\n${stderr || stdout}`,
    )
  }
  return stdout.trim()
}

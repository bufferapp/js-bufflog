import { Writable } from 'stream'

export interface LogLine {
  [key: string]: any
}

// bufflog builds its pino logger at import time and writes to stdout. The tests
// mock the pino module so that logger writes here instead, which keeps the real
// pino level and redaction config in play.
export const lines: LogLine[] = []

export const sink = new Writable({
  write(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    String(chunk)
      .split('\n')
      .filter((line: string) => line.length > 0)
      .forEach((line: string) => lines.push(JSON.parse(line)))
    callback()
  },
})

export function reset(): void {
  lines.length = 0
}

export function lastLine(): LogLine {
  return lines[lines.length - 1]
}

export function findLine(
  predicate: (line: LogLine) => boolean
): LogLine | undefined {
  return lines.filter(predicate)[0]
}

// The middleware logs on the response "finish" event, which can land after the
// client has already seen the end of the response.
export async function waitForLine(
  predicate: (line: LogLine) => boolean,
  timeoutMs: number = 1000
): Promise<LogLine> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const match = findLine(predicate)
    if (match) {
      return match
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  throw new Error('timed out waiting for a matching log line')
}

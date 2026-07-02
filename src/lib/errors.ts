/**
 * Error shaping for the CLI: turn any failure (raw HTTP from the escape-hatch or a
 * typed `SelectwinError` from the SDK) into a readable message + a STABLE exit code
 * keyed on the API `error.code` / HTTP status — never on the message text.
 */
import chalk from 'chalk'

/** Stable, documented exit codes. */
export const EXIT = {
  GENERIC: 1,
  AUTHENTICATION: 10,
  PERMISSION: 11,
  NOT_FOUND: 12,
  CONFLICT: 13,
  VALIDATION: 14,
  CARD: 15,
  RATE_LIMIT: 16,
  API: 17,
  CONNECTION: 18,
} as const

/** The `{ error: { code, message, params } }` envelope returned by the API. */
export interface ErrorEnvelope {
  error?: { code?: string; message?: string; params?: unknown; displayMessage?: string; reversible?: boolean }
}

/** Thrown by the raw escape-hatch client on a non-2xx response. */
export class ApiRequestError extends Error {
  readonly status: number
  readonly code?: string
  readonly body?: unknown
  readonly requestId?: string

  constructor(status: number, message: string, opts: { code?: string; body?: unknown; requestId?: string } = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = opts.code
    this.body = opts.body
    this.requestId = opts.requestId
  }
}

function exitCodeFor(status?: number): number {
  switch (status) {
    case 401:
      return EXIT.AUTHENTICATION
    case 402:
      return EXIT.CARD
    case 403:
      return EXIT.PERMISSION
    case 404:
      return EXIT.NOT_FOUND
    case 409:
      return EXIT.CONFLICT
    case 400:
    case 422:
      return EXIT.VALIDATION
    case 429:
      return EXIT.RATE_LIMIT
    default:
      if (status && status >= 500) return EXIT.API
      return EXIT.GENERIC
  }
}

interface Formatted {
  message: string
  exitCode: number
}

/** Duck-typed read of `status`/`code`/`requestId` off SDK errors or ApiRequestError. */
function readField<T>(err: unknown, key: string): T | undefined {
  if (err && typeof err === 'object' && key in err) return (err as Record<string, unknown>)[key] as T
  return undefined
}

export function formatError(err: unknown): Formatted {
  // Network/connection failures (SDK ApiConnectionError or a raw fetch throw).
  const name = readField<string>(err, 'name')
  if (name === 'ApiConnectionError' || (err instanceof TypeError && /fetch/i.test(String(err)))) {
    return {
      message: chalk.red('Connection error: could not reach the Selectwin API.'),
      exitCode: EXIT.CONNECTION,
    }
  }

  const status = readField<number>(err, 'status')
  const code = readField<string>(err, 'code')
  const requestId = readField<string>(err, 'requestId')
  const baseMessage = readField<string>(err, 'message') ?? String(err)

  if (status !== undefined || code !== undefined) {
    const parts = [chalk.red(`Error${status ? ` (HTTP ${status})` : ''}: ${baseMessage}`)]
    if (code) parts.push(chalk.dim(`  code: ${code}`))
    // Card decline extras (402).
    const displayMessage = readField<string>(err, 'displayMessage')
    if (displayMessage) parts.push(chalk.yellow(`  ${displayMessage}`))
    if (requestId) parts.push(chalk.dim(`  request id: ${requestId}`))
    return { message: parts.join('\n'), exitCode: exitCodeFor(status) }
  }

  return { message: chalk.red(baseMessage), exitCode: EXIT.GENERIC }
}

/**
 * Key/profile resolution and the two ways the CLI talks to the API:
 *   - `makeSdk()`   — the published @selectwin/sdk (typed resource commands).
 *   - `rawRequest()`— a thin fetch for the generic get/post/… escape-hatch
 *     (arbitrary paths the SDK has no typed method for).
 * Both authenticate with the `selectkey` header and share key resolution.
 */
import { randomUUID } from 'node:crypto'
import { Selectwin } from '@selectwin/sdk'
import { loadConfig, resolveProfileName, type Profile } from './config.js'
import { ApiRequestError, type ErrorEnvelope } from './errors.js'

export const CLI_VERSION = '0.1.0'
export const DEFAULT_BASE_URL = 'https://api.selectwin.io'
const USER_AGENT = `selectwin-cli/${CLI_VERSION}`

/** Flags every command shares that influence which credentials/host are used. */
export interface ClientFlags {
  profile?: string
  'api-key'?: string
  'base-url'?: string
}

export interface ResolvedKey {
  key: string
  source: 'flag' | 'env' | 'profile'
  profileName: string
}

function profileFor(flags: ClientFlags): { name: string; profile: Profile } {
  const config = loadConfig()
  const name = resolveProfileName(config, flags.profile)
  return { name, profile: config.profiles[name] ?? {} }
}

export function resolveApiKey(flags: ClientFlags): ResolvedKey {
  const { name, profile } = profileFor(flags)
  if (flags['api-key']) return { key: flags['api-key'], source: 'flag', profileName: name }
  if (process.env.SELECTWIN_API_KEY) return { key: process.env.SELECTWIN_API_KEY, source: 'env', profileName: name }
  if (profile.api_key) return { key: profile.api_key, source: 'profile', profileName: name }
  throw new Error(
    `No API key found. Run \`selectwin login\`, pass \`--api-key\`, or set SELECTWIN_API_KEY. ` +
      `(profile: ${name})`,
  )
}

export function resolveBaseUrl(flags: ClientFlags): string {
  const { profile } = profileFor(flags)
  return flags['base-url'] ?? process.env.SELECTWIN_BASE_URL ?? profile.base_url ?? DEFAULT_BASE_URL
}

export function makeSdk(flags: ClientFlags): Selectwin {
  const { key } = resolveApiKey(flags)
  return new Selectwin(key, { baseUrl: resolveBaseUrl(flags), userAgent: USER_AGENT })
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export interface RawResult {
  status: number
  body: unknown
}

export async function rawRequest(
  flags: ClientFlags,
  method: string,
  path: string,
  opts: { body?: unknown; idempotencyKey?: string } = {},
): Promise<RawResult> {
  const { key } = resolveApiKey(flags)
  const base = resolveBaseUrl(flags).replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  const url = /^https?:\/\//i.test(path) ? path : `${base}${suffix}`
  const upper = method.toUpperCase()

  const headers: Record<string, string> = {
    selectkey: key,
    accept: 'application/json',
    'user-agent': USER_AGENT,
  }
  if (opts.body !== undefined) headers['content-type'] = 'application/json'
  if (MUTATING.has(upper)) headers['x-idempotency-key'] = opts.idempotencyKey ?? randomUUID()

  let res: Response
  try {
    res = await fetch(url, {
      method: upper,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    })
  } catch (cause) {
    throw new ApiRequestError(0, `could not reach ${url}`, { code: 'connection_error' })
  }

  const text = await res.text()
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : undefined
  } catch {
    parsed = text
  }

  if (!res.ok) {
    const env = (parsed ?? {}) as ErrorEnvelope
    const message = env.error?.message ?? `request failed with status ${res.status}`
    throw new ApiRequestError(res.status, message, {
      code: env.error?.code,
      body: parsed,
      requestId: res.headers.get('x-request-id') ?? undefined,
    })
  }

  return { status: res.status, body: parsed }
}

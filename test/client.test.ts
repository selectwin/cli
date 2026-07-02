import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rawRequest, resolveApiKey } from '../dist/lib/client.js'
import { upsertProfile } from '../dist/lib/config.js'

function mockFetch(status: number, body?: unknown, headers: Record<string, string> = {}) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  })) as unknown as typeof fetch
}

let dir: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sw-cli-'))
  process.env.SELECTWIN_CONFIG_DIR = dir
})
afterEach(() => {
  delete process.env.SELECTWIN_CONFIG_DIR
  delete process.env.SELECTWIN_API_KEY
  rmSync(dir, { recursive: true, force: true })
  vi.unstubAllGlobals()
})

describe('resolveApiKey', () => {
  it('prefers flag > env > profile', () => {
    upsertProfile('default', { api_key: 'sk_test_profile' })
    process.env.SELECTWIN_API_KEY = 'sk_test_env'
    expect(resolveApiKey({ 'api-key': 'sk_test_flag' }).source).toBe('flag')
    expect(resolveApiKey({}).source).toBe('env')
    delete process.env.SELECTWIN_API_KEY
    expect(resolveApiKey({}).source).toBe('profile')
  })

  it('throws a helpful error when no key is set', () => {
    expect(() => resolveApiKey({})).toThrow(/No API key/)
  })
})

describe('rawRequest', () => {
  it('sends the selectkey header and parses JSON', async () => {
    const f = mockFetch(200, { ok: true })
    vi.stubGlobal('fetch', f)
    process.env.SELECTWIN_API_KEY = 'sk_test_abc'
    const res = await rawRequest({}, 'GET', '/v1/ping')
    expect(res.status).toBe(200)
    const init = (f as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]![1] as RequestInit & {
      headers: Record<string, string>
    }
    expect(init.headers.selectkey).toBe('sk_test_abc')
  })

  it('adds an idempotency key + JSON body on POST', async () => {
    const f = mockFetch(200, {})
    vi.stubGlobal('fetch', f)
    process.env.SELECTWIN_API_KEY = 'sk_test_abc'
    await rawRequest({}, 'POST', '/v1/x', { body: { a: 1 } })
    const init = (f as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]![1] as RequestInit & {
      headers: Record<string, string>
    }
    expect(init.headers['x-idempotency-key']).toBeTruthy()
    expect(init.body).toBe(JSON.stringify({ a: 1 }))
  })

  it('throws ApiRequestError on non-2xx with the envelope code', async () => {
    vi.stubGlobal('fetch', mockFetch(402, { error: { code: 'card_declined', message: 'no' } }))
    process.env.SELECTWIN_API_KEY = 'sk_test_abc'
    await expect(rawRequest({}, 'POST', '/v1/x', { body: {} })).rejects.toMatchObject({
      status: 402,
      code: 'card_declined',
    })
  })
})

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runCommand } from '@oclif/test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function mockFetch(status: number, body?: unknown) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
    headers: { get: () => null },
  })) as unknown as typeof fetch
}

let dir: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sw-cli-'))
  process.env.SELECTWIN_CONFIG_DIR = dir
  process.env.SELECTWIN_API_KEY = 'sk_test_abc'
})
afterEach(() => {
  delete process.env.SELECTWIN_CONFIG_DIR
  delete process.env.SELECTWIN_API_KEY
  rmSync(dir, { recursive: true, force: true })
  vi.unstubAllGlobals()
})

describe('commands', () => {
  it('get calls the API and returns the parsed body', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { pong: true }))
    const { result } = await runCommand(['get', '/v1/ping', '--json'], { root: process.cwd() })
    expect(result).toMatchObject({ pong: true })
  })

  it('whoami validates the key and reports the environment', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { data: [] }))
    const { result } = await runCommand(['whoami', '--json'], { root: process.cwd() })
    expect(result).toMatchObject({ environment: 'sandbox', keySource: 'env' })
  })

  it('surfaces API errors with a non-zero exit code', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: { code: 'unauthorized', message: 'bad key' } }))
    const { error } = await runCommand(['whoami'], { root: process.cwd() })
    expect(error?.oclif?.exit).toBe(10)
  })
})

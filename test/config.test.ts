import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadConfig, maskKey, removeProfile, resolveProfileName, upsertProfile } from '../dist/lib/config.js'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sw-cli-'))
  process.env.SELECTWIN_CONFIG_DIR = dir
})
afterEach(() => {
  delete process.env.SELECTWIN_CONFIG_DIR
  rmSync(dir, { recursive: true, force: true })
})

describe('config', () => {
  it('upserts and reloads a profile, sets it as default', () => {
    upsertProfile('sandbox', { api_key: 'sk_test_abc' })
    const c = loadConfig()
    expect(c.profiles.sandbox?.api_key).toBe('sk_test_abc')
    expect(c.default_profile).toBe('sandbox')
  })

  it('resolves profile name by precedence', () => {
    upsertProfile('sandbox', { api_key: 'sk_test_abc' })
    const c = loadConfig()
    expect(resolveProfileName(c)).toBe('sandbox')
    expect(resolveProfileName(c, 'live')).toBe('live')
  })

  it('removes profiles and reports missing ones', () => {
    upsertProfile('sandbox', { api_key: 'sk_test_abc' })
    expect(removeProfile('sandbox')).toBe(true)
    expect(removeProfile('nope')).toBe(false)
  })

  it('masks keys', () => {
    expect(maskKey('sk_live_1234567890abcd')).toBe('sk_live_…abcd')
    expect(maskKey('short')).toContain('…')
  })
})

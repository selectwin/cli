/**
 * Profile store — `~/.selectwin/config.toml` (chmod 0600).
 *
 *   default_profile = "sandbox"
 *   [profiles.sandbox]
 *   api_key  = "sk_test_…"
 *   base_url = "https://api.selectwin.io"   # optional override
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { parse, stringify } from 'smol-toml'

export interface Profile {
  api_key?: string
  base_url?: string
}

export interface CliConfig {
  default_profile?: string
  profiles: Record<string, Profile>
}

export const DEFAULT_PROFILE = 'default'

export function configDir(): string {
  return process.env.SELECTWIN_CONFIG_DIR ?? join(homedir(), '.selectwin')
}

export function configPath(): string {
  return join(configDir(), 'config.toml')
}

export function loadConfig(): CliConfig {
  const path = configPath()
  if (!existsSync(path)) return { profiles: {} }
  const parsed = parse(readFileSync(path, 'utf8')) as Partial<CliConfig>
  return {
    default_profile: parsed.default_profile,
    profiles: (parsed.profiles as Record<string, Profile>) ?? {},
  }
}

export function saveConfig(config: CliConfig): void {
  const path = configPath()
  mkdirSync(dirname(path), { recursive: true })
  // smol-toml drops undefined; keep the file clean.
  const clean: CliConfig = { profiles: config.profiles }
  if (config.default_profile) clean.default_profile = config.default_profile
  writeFileSync(path, stringify(clean), 'utf8')
  try {
    chmodSync(path, 0o600) // best effort — no-op semantics on Windows
  } catch {
    /* ignore */
  }
}

/** Resolve which profile to use: explicit name > config default > "default". */
export function resolveProfileName(config: CliConfig, explicit?: string): string {
  return explicit ?? config.default_profile ?? DEFAULT_PROFILE
}

export function upsertProfile(name: string, patch: Profile): CliConfig {
  const config = loadConfig()
  config.profiles[name] = { ...config.profiles[name], ...patch }
  if (!config.default_profile) config.default_profile = name
  saveConfig(config)
  return config
}

export function removeProfile(name: string): boolean {
  const config = loadConfig()
  if (!config.profiles[name]) return false
  delete config.profiles[name]
  if (config.default_profile === name) {
    config.default_profile = Object.keys(config.profiles)[0]
  }
  saveConfig(config)
  return true
}

/** Mask a key for display: sk_live_abcd…wxyz. */
export function maskKey(key: string): string {
  if (key.length <= 12) return `${key.slice(0, 3)}…`
  return `${key.slice(0, 8)}…${key.slice(-4)}`
}

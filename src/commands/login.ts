import { createInterface } from 'node:readline/promises'
import { BaseCommand } from '../lib/base.js'
import { loadConfig, maskKey, resolveProfileName, upsertProfile } from '../lib/config.js'

export default class Login extends BaseCommand<typeof Login> {
  static description = 'Save an API key to a profile (~/.selectwin/config.toml).'

  static examples = [
    '<%= config.bin %> login --api-key sk_test_123',
    '<%= config.bin %> login --profile live',
  ]

  async run(): Promise<{ profile: string; environment: string; key: string }> {
    let key = this.flags['api-key'] ?? process.env.SELECTWIN_API_KEY
    if (!key) {
      if (!process.stdin.isTTY) {
        this.error('No API key. Pass --api-key sk_… or set SELECTWIN_API_KEY.', { exit: 2 })
      }
      const rl = createInterface({ input: process.stdin, output: process.stdout })
      key = (await rl.question('Enter your Selectwin API key (sk_test_… / sk_live_…): ')).trim()
      rl.close()
    }
    if (!/^sk_(test|live)_/.test(key)) {
      this.error('That does not look like a Selectwin key (expected sk_test_… or sk_live_…).', { exit: 2 })
    }

    const config = loadConfig()
    const name = resolveProfileName(config, this.flags.profile)
    upsertProfile(name, { api_key: key, base_url: this.flags['base-url'] })
    const environment = key.startsWith('sk_live_') ? 'live' : 'sandbox'

    if (!this.jsonEnabled()) this.log(`Saved ${maskKey(key)} to profile "${name}" (${environment}).`)
    return { profile: name, environment, key: maskKey(key) }
  }
}

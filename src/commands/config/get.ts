import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { loadConfig, maskKey, resolveProfileName } from '../../lib/config.js'
import { formatKeyValues } from '../../lib/output.js'

export default class ConfigGet extends BaseCommand<typeof ConfigGet> {
  static description = "Show a profile's settings."

  static args = {
    profile: Args.string({ description: 'profile name (default: active)' }),
  }

  async run(): Promise<Record<string, string>> {
    const config = loadConfig()
    const name = this.args.profile ?? resolveProfileName(config, this.flags.profile)
    const p = config.profiles[name]
    if (!p) return this.error(`No profile "${name}".`, { exit: 2 })
    const info = {
      profile: name,
      key: p.api_key ? maskKey(p.api_key) : '(none)',
      base_url: p.base_url ?? '(default)',
    }
    if (!this.jsonEnabled()) this.log(formatKeyValues(info))
    return info
  }
}

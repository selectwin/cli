import { BaseCommand } from '../../lib/base.js'
import { loadConfig, maskKey } from '../../lib/config.js'
import { formatTable } from '../../lib/output.js'

export default class ConfigList extends BaseCommand<typeof ConfigList> {
  static description = 'List saved profiles.'

  async run(): Promise<Record<string, unknown>[]> {
    const config = loadConfig()
    const rows = Object.entries(config.profiles).map(([name, p]) => ({
      profile: name,
      default: name === config.default_profile,
      key: p.api_key ? maskKey(p.api_key) : '(none)',
      base_url: p.base_url ?? '',
    }))
    if (!this.jsonEnabled()) {
      this.log(rows.length ? formatTable(rows) : 'No profiles yet. Run `selectwin login`.')
    }
    return rows
  }
}

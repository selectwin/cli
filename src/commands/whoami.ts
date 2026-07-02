import { BaseCommand } from '../lib/base.js'
import { maskKey } from '../lib/config.js'
import { rawRequest, resolveApiKey, resolveBaseUrl } from '../lib/client.js'
import { formatKeyValues } from '../lib/output.js'

export default class Whoami extends BaseCommand<typeof Whoami> {
  static description = 'Validate the active key and show the profile / environment.'

  static examples = ['<%= config.bin %> whoami', '<%= config.bin %> whoami --profile live']

  async run(): Promise<Record<string, string>> {
    const flags = this.clientFlags()
    const { key, profileName, source } = resolveApiKey(flags)
    // A cheap authenticated read; throws (→ mapped exit code) if the key is bad.
    await rawRequest(flags, 'GET', '/v1/customers?limit=1')

    const info = {
      profile: profileName,
      environment: key.startsWith('sk_live_') ? 'live' : 'sandbox',
      key: maskKey(key),
      keySource: source,
      baseUrl: resolveBaseUrl(flags),
    }
    if (!this.jsonEnabled()) this.log(formatKeyValues(info))
    return info
  }
}

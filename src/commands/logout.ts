import { BaseCommand } from '../lib/base.js'
import { loadConfig, removeProfile, resolveProfileName } from '../lib/config.js'

export default class Logout extends BaseCommand<typeof Logout> {
  static description = "Remove a profile's stored credentials."

  static examples = ['<%= config.bin %> logout', '<%= config.bin %> logout --profile live']

  async run(): Promise<{ profile: string; removed: boolean }> {
    const config = loadConfig()
    const name = resolveProfileName(config, this.flags.profile)
    const removed = removeProfile(name)
    if (!this.jsonEnabled()) {
      this.log(removed ? `Removed profile "${name}".` : `No profile "${name}" to remove.`)
    }
    return { profile: name, removed }
  }
}

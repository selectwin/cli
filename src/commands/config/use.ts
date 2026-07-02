import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { loadConfig, saveConfig } from '../../lib/config.js'

export default class ConfigUse extends BaseCommand<typeof ConfigUse> {
  static description = 'Set the default profile.'

  static args = {
    profile: Args.string({ required: true, description: 'profile name' }),
  }

  async run(): Promise<{ default_profile: string }> {
    const config = loadConfig()
    if (!config.profiles[this.args.profile]) {
      return this.error(`No profile "${this.args.profile}". Run \`selectwin config list\`.`, { exit: 2 })
    }
    config.default_profile = this.args.profile
    saveConfig(config)
    if (!this.jsonEnabled()) this.log(`Default profile is now "${this.args.profile}".`)
    return { default_profile: this.args.profile }
  }
}

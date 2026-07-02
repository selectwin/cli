import { Command } from '@oclif/core'

/**
 * `selectwin version` — a real command mirroring the built-in `--version` flag,
 * so both forms work (users reach for the bare word). No auth needed.
 */
export default class Version extends Command {
  static description = 'Show the installed CLI version.'

  static examples = ['<%= config.bin %> version']

  async run(): Promise<void> {
    this.log(
      `${this.config.name}/${this.config.version} ${this.config.platform}-${this.config.arch} node-${process.version}`,
    )
  }
}

import { Flags } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class CustomersList extends BaseCommand<typeof CustomersList> {
  static description = 'List customers.'

  static examples = ['<%= config.bin %> customers list --limit 10']

  static flags = {
    limit: Flags.integer({ description: 'max items to return', default: 20 }),
  }

  async run(): Promise<unknown> {
    const page = await makeSdk(this.clientFlags()).customers.list({ limit: this.flags.limit } as never)
    return this.respond(page)
  }
}

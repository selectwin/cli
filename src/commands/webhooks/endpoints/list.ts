import { Flags } from '@oclif/core'
import { BaseCommand } from '../../../lib/base.js'
import { makeSdk } from '../../../lib/client.js'

export default class WebhooksEndpointsList extends BaseCommand<typeof WebhooksEndpointsList> {
  static description = 'List webhook endpoints.'

  static examples = ['<%= config.bin %> webhooks endpoints list']

  static flags = {
    limit: Flags.integer({ description: 'max items to return', default: 20 }),
  }

  async run(): Promise<unknown> {
    const page = await makeSdk(this.clientFlags()).webhooks.listEndpoints({ limit: this.flags.limit } as never)
    return this.respond(page)
  }
}

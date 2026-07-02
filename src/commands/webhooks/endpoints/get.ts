import { Args } from '@oclif/core'
import { BaseCommand } from '../../../lib/base.js'
import { makeSdk } from '../../../lib/client.js'

export default class WebhooksEndpointsGet extends BaseCommand<typeof WebhooksEndpointsGet> {
  static description = 'Retrieve a webhook endpoint by id.'

  static examples = ['<%= config.bin %> webhooks endpoints get whe_123']

  static args = {
    id: Args.string({ required: true, description: 'webhook endpoint id' }),
  }

  async run(): Promise<unknown> {
    const res = await makeSdk(this.clientFlags()).webhooks.retrieveEndpoint({ id: this.args.id } as never)
    return this.respond(res)
  }
}

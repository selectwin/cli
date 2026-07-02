import { Flags } from '@oclif/core'
import { BaseCommand } from '../../../lib/base.js'
import { makeSdk } from '../../../lib/client.js'

export default class WebhooksEndpointsCreate extends BaseCommand<typeof WebhooksEndpointsCreate> {
  static description = 'Create a webhook endpoint.'

  static examples = [
    '<%= config.bin %> webhooks endpoints create -d \'{"url":"https://ex.com/hook","events":["transaction.approved"]}\'',
  ]

  static flags = {
    data: Flags.string({ char: 'd', required: true, description: 'JSON body (CreateWebhookEndpointRequest)' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const res = await makeSdk(this.clientFlags()).webhooks.createEndpoint(body as never)
    return this.respond(res)
  }
}

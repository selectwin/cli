import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { rawRequest } from '../../lib/client.js'

export default class WebhooksTest extends BaseCommand<typeof WebhooksTest> {
  static description = 'Send a test (ping) delivery to a webhook endpoint.'

  static examples = ['<%= config.bin %> webhooks test whe_123']

  static args = {
    id: Args.string({ required: true, description: 'webhook endpoint id' }),
  }

  async run(): Promise<unknown> {
    const { body } = await rawRequest(this.clientFlags(), 'POST', `/v1/webhooks/${this.args.id}/test`, {
      idempotencyKey: this.flags['idempotency-key'],
    })
    return this.respond(body)
  }
}

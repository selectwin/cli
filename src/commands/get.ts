import { Args } from '@oclif/core'
import { BaseCommand } from '../lib/base.js'
import { rawRequest } from '../lib/client.js'

export default class Get extends BaseCommand<typeof Get> {
  static description = 'GET any API path (escape hatch — covers every endpoint).'

  static examples = [
    '<%= config.bin %> get /v1/customers?limit=3',
    '<%= config.bin %> get /v1/transactions/txn_123 --json',
  ]

  static args = {
    path: Args.string({ required: true, description: 'API path, e.g. /v1/customers' }),
  }

  async run(): Promise<unknown> {
    const { body } = await rawRequest(this.clientFlags(), 'GET', this.args.path)
    return this.respond(body)
  }
}

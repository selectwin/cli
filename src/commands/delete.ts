import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '../lib/base.js'
import { rawRequest } from '../lib/client.js'

export default class Delete extends BaseCommand<typeof Delete> {
  static description = 'DELETE any API path (escape hatch).'

  static examples = ['<%= config.bin %> delete /v1/customers/cus_123']

  static args = {
    path: Args.string({ required: true, description: 'API path' }),
  }

  static flags = {
    data: Flags.string({ char: 'd', description: 'optional JSON request body' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const { body: res } = await rawRequest(this.clientFlags(), 'DELETE', this.args.path, {
      body,
      idempotencyKey: this.flags['idempotency-key'],
    })
    return this.respond(res)
  }
}

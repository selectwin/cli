import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '../lib/base.js'
import { rawRequest } from '../lib/client.js'

export default class Post extends BaseCommand<typeof Post> {
  static description = 'POST to any API path with a JSON body (escape hatch).'

  static examples = ['<%= config.bin %> post /v1/customers -d \'{"firstName":"Ana","lastName":"Silva"}\'']

  static args = {
    path: Args.string({ required: true, description: 'API path' }),
  }

  static flags = {
    data: Flags.string({ char: 'd', description: 'JSON request body' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const { body: res } = await rawRequest(this.clientFlags(), 'POST', this.args.path, {
      body,
      idempotencyKey: this.flags['idempotency-key'],
    })
    return this.respond(res)
  }
}

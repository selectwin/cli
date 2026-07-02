import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '../lib/base.js'
import { rawRequest } from '../lib/client.js'

export default class Patch extends BaseCommand<typeof Patch> {
  static description = 'PATCH any API path with a JSON body (escape hatch).'

  static args = {
    path: Args.string({ required: true, description: 'API path' }),
  }

  static flags = {
    data: Flags.string({ char: 'd', description: 'JSON request body' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const { body: res } = await rawRequest(this.clientFlags(), 'PATCH', this.args.path, {
      body,
      idempotencyKey: this.flags['idempotency-key'],
    })
    return this.respond(res)
  }
}

import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class CustomersDelete extends BaseCommand<typeof CustomersDelete> {
  static description = 'Delete a customer by id.'

  static examples = ['<%= config.bin %> customers delete cus_123']

  static args = {
    id: Args.string({ required: true, description: 'customer id' }),
  }

  async run(): Promise<unknown> {
    const res = await makeSdk(this.clientFlags()).customers.delete(this.args.id)
    return this.respond(res)
  }
}

import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class CustomersGet extends BaseCommand<typeof CustomersGet> {
  static description = 'Retrieve a customer by id.'

  static examples = ['<%= config.bin %> customers get cus_123']

  static args = {
    id: Args.string({ required: true, description: 'customer id' }),
  }

  async run(): Promise<unknown> {
    const res = await makeSdk(this.clientFlags()).customers.retrieve(this.args.id)
    return this.respond(res)
  }
}

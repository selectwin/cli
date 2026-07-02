import { Args } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class TransactionsGet extends BaseCommand<typeof TransactionsGet> {
  static description = 'Retrieve a transaction by id.'

  static examples = ['<%= config.bin %> transactions get txn_123']

  static args = {
    id: Args.string({ required: true, description: 'transaction id' }),
  }

  async run(): Promise<unknown> {
    const res = await makeSdk(this.clientFlags()).transactions.retrieve(this.args.id)
    return this.respond(res)
  }
}

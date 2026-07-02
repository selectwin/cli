import { Flags } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class TransactionsCreate extends BaseCommand<typeof TransactionsCreate> {
  static description = 'Create a transaction.'

  static examples = ['<%= config.bin %> transactions create -d \'{"amount":1000,"currency":"BRL","paymentMethod":"pix"}\'']

  static flags = {
    data: Flags.string({ char: 'd', required: true, description: 'JSON body (CreateTransactionRequest)' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const res = await makeSdk(this.clientFlags()).transactions.create(body as never)
    return this.respond(res)
  }
}

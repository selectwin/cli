import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class TransactionsRefund extends BaseCommand<typeof TransactionsRefund> {
  static description = 'Refund a transaction (full or partial).'

  static examples = [
    '<%= config.bin %> transactions refund txn_123',
    '<%= config.bin %> transactions refund txn_123 -d \'{"amount":500}\'',
  ]

  static args = {
    id: Args.string({ required: true, description: 'transaction id' }),
  }

  static flags = {
    data: Flags.string({ char: 'd', description: 'JSON body (RefundTransactionRequest)' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data) ?? {}
    const res = await makeSdk(this.clientFlags()).transactions.refund(this.args.id, body as never)
    return this.respond(res)
  }
}

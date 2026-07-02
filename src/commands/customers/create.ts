import { Flags } from '@oclif/core'
import { BaseCommand } from '../../lib/base.js'
import { makeSdk } from '../../lib/client.js'

export default class CustomersCreate extends BaseCommand<typeof CustomersCreate> {
  static description = 'Create a customer.'

  static examples = ['<%= config.bin %> customers create -d \'{"firstName":"Ana","lastName":"Silva","email":"ana@ex.com"}\'']

  static flags = {
    data: Flags.string({ char: 'd', required: true, description: 'JSON body (CreateCustomerRequest)' }),
  }

  async run(): Promise<unknown> {
    const body = this.parseBody(this.flags.data)
    const res = await makeSdk(this.clientFlags()).customers.create(body as never)
    return this.respond(res)
  }
}

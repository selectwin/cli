/**
 * BaseCommand — global flags (profile / api-key / base-url / idempotency-key /
 * verbose), the `--json` toggle (oclif's enableJsonFlag), a uniform human/JSON
 * responder, and API-error → exit-code handling shared by every command.
 */
import { Command, Flags, type Interfaces } from '@oclif/core'
import { type ClientFlags } from './client.js'
import { formatError } from './errors.js'
import { summarize } from './output.js'

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static enableJsonFlag = true

  static baseFlags = {
    profile: Flags.string({ description: 'config profile to use', helpGroup: 'GLOBAL' }),
    'api-key': Flags.string({ description: 'API key (overrides profile/env)', helpGroup: 'GLOBAL' }),
    'base-url': Flags.string({ description: 'API base URL override', helpGroup: 'GLOBAL' }),
    'idempotency-key': Flags.string({ description: 'idempotency key for mutations', helpGroup: 'GLOBAL' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose output', helpGroup: 'GLOBAL' }),
  }

  protected flags!: Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
  protected args!: Interfaces.InferredArgs<T['args']>

  public async init(): Promise<void> {
    await super.init()
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as typeof this.flags
    this.args = args as typeof this.args
  }

  /** The subset of flags that select credentials/host. */
  protected clientFlags(): ClientFlags {
    return {
      profile: this.flags.profile,
      'api-key': this.flags['api-key'],
      'base-url': this.flags['base-url'],
    }
  }

  /** Render a result: raw JSON under `--json`, otherwise a human summary. */
  protected respond<R>(data: R): R {
    if (!this.jsonEnabled()) this.log(summarize(data))
    return data
  }

  /** Parse a `--data`/`-d` JSON flag; a usage error (exit 2) on invalid JSON. */
  protected parseBody(data?: string): unknown {
    if (data === undefined) return undefined
    try {
      return JSON.parse(data)
    } catch (e) {
      return this.error(`--data is not valid JSON: ${(e as Error).message}`, { exit: 2 })
    }
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    // Let oclif handle its own control-flow errors (help, exit, parse errors).
    const anyErr = err as unknown as { oclif?: unknown }
    if (err.constructor?.name === 'ExitError' || anyErr.oclif !== undefined) {
      return super.catch(err as Interfaces.CommandError)
    }
    const { message, exitCode } = formatError(err)
    // oclif silences BOTH log() and logToStderr() under --json, so a plain
    // logToStderr() here would make failures silent in scripting mode (only the
    // exit code survives). Under --json emit a machine-readable error envelope
    // straight to stdout; otherwise print the human line to stderr.
    if (this.jsonEnabled()) {
      const e = err as unknown as { message?: string; code?: string; status?: number; requestId?: string }
      const envelope = { error: { message: e.message ?? String(err), code: e.code, status: e.status, requestId: e.requestId } }
      process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`)
    } else {
      this.logToStderr(message)
    }
    return this.exit(exitCode)
  }
}

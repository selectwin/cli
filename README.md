# @selectwin/cli

The **Selectwin** command-line interface — authenticate, call any endpoint, and
manage resources from your terminal. Built on [oclif](https://oclif.io) and the
official [`@selectwin/sdk`](https://www.npmjs.com/package/@selectwin/sdk).

> Status: **early (`0.1.0`).** MVP = auth/profiles, the `get/post/…` escape hatch
> (100% API coverage), curated commands for the hot flows, and `webhooks test`.
> `listen` / `trigger` (local webhook forwarding + synthetic events) are planned
> and depend on new backend streaming — see the roadmap.

## Install

```bash
npm install -g @selectwin/cli
selectwin --help
```

## Authenticate

Keys are stored per profile in `~/.selectwin/config.toml` (chmod 0600). The
environment (sandbox/production) is decided by the key prefix — `sk_test_` vs
`sk_live_`.

```bash
selectwin login --api-key sk_test_…          # saves to the default profile
selectwin login --profile live --api-key sk_live_…
selectwin whoami                              # validate + show the active profile
selectwin config list                         # list profiles
selectwin config use live                     # switch the default profile
```

Key precedence: `--api-key` flag › `$SELECTWIN_API_KEY` › active profile.

## Call the API

**Escape hatch** — reach any endpoint directly:

```bash
selectwin get /v1/customers?limit=3
selectwin post /v1/customers -d '{"firstName":"Ana","lastName":"Silva"}'
selectwin patch /v1/customers/cus_123 -d '{"email":"ana@ex.com"}'
selectwin delete /v1/customers/cus_123
```

**Curated commands** — ergonomic wrappers over the SDK for the common flows:

```bash
selectwin transactions create -d '{"amount":1000,"currency":"BRL","paymentMethod":"pix"}'
selectwin transactions list --limit 10
selectwin transactions get txn_123
selectwin transactions refund txn_123 -d '{"amount":500}'

selectwin customers create -d '{"firstName":"Ana","lastName":"Silva"}'
selectwin customers list
selectwin customers get cus_123
selectwin customers delete cus_123

selectwin webhooks endpoints list
selectwin webhooks endpoints create -d '{"url":"https://ex.com/hook","events":["transaction.approved"]}'
selectwin webhooks test whe_123
```

Anything without a curated command is reachable through the escape hatch.

## Global flags

`--profile` · `--api-key` · `--base-url` · `--idempotency-key` · `--json` · `-v/--verbose`

- `--json` prints the raw response body (pipe-friendly for `jq`); otherwise output
  is a compact table (lists) or key/value view (single objects).
- Mutations get an automatic `X-Idempotency-Key`; override with `--idempotency-key`.
- Errors map the API `{ error: { code, message } }` envelope to a readable message
  and a **stable exit code** keyed on the HTTP status (401→10, 402→15, 404→12,
  409→13, 422→14, 429→16, 5xx→17, connection→18).

## Development

```bash
npm install
npm run build      # tsc → dist/
npm test           # vitest (builds first via pretest)
npm run typecheck  # tsc --noEmit
node bin/run.js --help
```

## Roadmap

1. **MVP** (this release): login/profiles, escape hatch, curated transactions/
   customers/webhooks, mapped errors, JSON/table output.
2. More curated resources (subscriptions, products, coupons, wallets, checkouts…).
3. **`listen`** (stream events → forward to `localhost`, verifying the HMAC
   signature) and **`trigger`** (synthetic test events) — require new node-api
   streaming endpoints.
4. Shell completions, `upgrade`, Homebrew/Scoop distribution.

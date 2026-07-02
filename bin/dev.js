#!/usr/bin/env node
// Development entrypoint — runs the TypeScript sources directly via tsx.
import { execute } from '@oclif/core'

await execute({ development: true, dir: import.meta.url })

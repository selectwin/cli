#!/usr/bin/env node
// Production entrypoint — runs the compiled CLI in ./dist.
import { execute } from '@oclif/core'

await execute({ dir: import.meta.url })

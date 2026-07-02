import { describe, expect, it } from 'vitest'
import { ApiRequestError, EXIT, formatError } from '../dist/lib/errors.js'

describe('formatError', () => {
  it('maps 401 → authentication exit code', () => {
    const { exitCode } = formatError(new ApiRequestError(401, 'bad key', { code: 'unauthorized' }))
    expect(exitCode).toBe(EXIT.AUTHENTICATION)
  })

  it('maps 402 → card exit code and shows the message', () => {
    const { exitCode, message } = formatError(new ApiRequestError(402, 'card declined', { code: 'card_declined' }))
    expect(exitCode).toBe(EXIT.CARD)
    expect(message).toContain('HTTP 402')
    expect(message).toContain('card_declined')
  })

  it('maps 404 → not found, 429 → rate limit, 5xx → api', () => {
    expect(formatError(new ApiRequestError(404, 'x')).exitCode).toBe(EXIT.NOT_FOUND)
    expect(formatError(new ApiRequestError(429, 'x')).exitCode).toBe(EXIT.RATE_LIMIT)
    expect(formatError(new ApiRequestError(503, 'x')).exitCode).toBe(EXIT.API)
  })

  it('treats a bare fetch TypeError as a connection error', () => {
    const { exitCode } = formatError(new TypeError('fetch failed'))
    expect(exitCode).toBe(EXIT.CONNECTION)
  })

  it('falls back to generic for unknown errors', () => {
    expect(formatError(new Error('boom')).exitCode).toBe(EXIT.GENERIC)
  })
})

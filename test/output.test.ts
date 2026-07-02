import { describe, expect, it } from 'vitest'
import { formatKeyValues, formatTable, pickColumns, summarize } from '../dist/lib/output.js'

describe('output', () => {
  it('picks preferred scalar columns', () => {
    const cols = pickColumns([{ id: '1', status: 'ok', nested: { a: 1 }, name: 'x' }])
    expect(cols).toContain('id')
    expect(cols).toContain('status')
    expect(cols).not.toContain('nested')
  })

  it('renders a table with a header', () => {
    const t = formatTable([{ id: 'a', status: 'ok' }])
    expect(t).toContain('id')
    expect(t).toContain('a')
  })

  it('renders key/values', () => {
    const kv = formatKeyValues({ id: 'a', amount: 100 })
    expect(kv).toContain('id')
    expect(kv).toContain('100')
  })

  it('summarize handles list envelopes', () => {
    const s = summarize({ data: [{ id: 'a' }, { id: 'b' }], hasMore: false })
    expect(s).toContain('a')
    expect(s).toContain('b')
  })

  it('summarize handles a single object', () => {
    expect(summarize({ id: 'a', object: 'customer' })).toContain('customer')
  })
})

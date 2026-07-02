/**
 * Rendering helpers (pure — return strings; commands do the printing).
 * Human output is a compact table for lists and key/value lines for single
 * objects; `--json` (handled by oclif) bypasses all of this.
 */
import chalk from 'chalk'

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

function isScalar(v: unknown): v is string | number | boolean | null {
  return v === null || ['string', 'number', 'boolean'].includes(typeof v)
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (isScalar(v)) return String(v)
  return Array.isArray(v) ? `[${v.length}]` : '{…}'
}

const PREFERRED = [
  'id',
  'object',
  'type',
  'status',
  'name',
  'title',
  'email',
  'amount',
  'currency',
  'code',
  'url',
  'createdAt',
  'created',
]

/** Choose up to `max` scalar columns, preferring common fields. */
export function pickColumns(rows: Record<string, unknown>[], max = 6): string[] {
  const seen = new Set<string>()
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (isScalar(v)) seen.add(k)
    }
  }
  const ordered = [...PREFERRED.filter((k) => seen.has(k)), ...[...seen].filter((k) => !PREFERRED.includes(k))]
  return ordered.slice(0, max)
}

export function formatTable(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return chalk.dim('(no results)')
  const cols = columns ?? pickColumns(rows)
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => cell(r[c]).length)))
  const header = cols.map((c, i) => chalk.bold(c.padEnd(widths[i]!))).join('  ')
  const sep = cols.map((_, i) => '─'.repeat(widths[i]!)).join('  ')
  const body = rows
    .map((r) => cols.map((c, i) => cell(r[c]).padEnd(widths[i]!)).join('  '))
    .join('\n')
  return `${header}\n${chalk.dim(sep)}\n${body}`
}

export function formatKeyValues(obj: Record<string, unknown>, keys?: string[]): string {
  const entries = (keys ?? Object.keys(obj)).filter((k) => k in obj)
  const width = Math.max(0, ...entries.map((k) => k.length))
  return entries.map((k) => `${chalk.bold(k.padEnd(width))}  ${cell(obj[k])}`).join('\n')
}

/** Best-effort human render for an arbitrary API response. */
export function summarize(data: unknown): string {
  if (Array.isArray(data)) {
    return formatTable(data.filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null))
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) {
      const rows = (obj.data as unknown[]).filter(
        (r): r is Record<string, unknown> => typeof r === 'object' && r !== null,
      )
      const more = obj.hasMore ? chalk.dim('\n(more results available — use --limit / pagination)') : ''
      return `${formatTable(rows)}${more}`
    }
    return formatKeyValues(obj)
  }
  return String(data)
}

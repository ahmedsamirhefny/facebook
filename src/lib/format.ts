export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 5) return 'Just now'
  if (diff < 60) return `${diff}s`
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return `${m}m`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `${h}h`
  }
  if (diff < 604800) {
    const day = Math.floor(diff / 86400)
    return `${day}d`
  }
  if (diff < 2592000) {
    const wk = Math.floor(diff / 604800)
    return `${wk}w`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function pluralize(n: number, singular: string, plural?: string) {
  return n === 1 ? `${n} ${singular}` : `${n} ${plural ?? singular + 's'}`
}

export function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

// Compact number formatting: 1200 -> 1.2K, 1500000 -> 1.5M
export function compact(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    const v = n / 1000
    return `${v % 1 === 0 ? v : v.toFixed(1)}K`
  }
  const v = n / 1_000_000
  return `${v % 1 === 0 ? v : v.toFixed(1)}M`
}

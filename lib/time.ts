import type { MinuteOfDay } from './types'

/** "09:30", "14:05" — 24h, zero padded, stable across locales. */
export function formatTime(minute: MinuteOfDay): string {
  const h = Math.floor(minute / 60) % 24
  const m = minute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "1h 30m", "45m", "2h" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatRange(start: MinuteOfDay, end: MinuteOfDay): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** Minutes since local midnight for the given date. */
export function minuteOfDay(date: Date): MinuteOfDay {
  return date.getHours() * 60 + date.getMinutes()
}

export function dayOffsetLabel(offset: number): string {
  if (offset === 0) return 'today'
  if (offset === 1) return 'tomorrow'
  return `in ${offset} days`
}

import type { AvailabilityBlock, MinuteOfDay, TimelineEntry } from './types'

/** Vertical scale of the timeline: pixels per minute. */
export const PX_PER_MINUTE = 1.35
/** Enough room for a title row plus the mono meta row. */
export const MIN_BLOCK_HEIGHT = 56
/** Gaps shorter than this are not worth annotating. */
const MIN_LABELLED_GAP_PX = 30
/** Breathing room between stacked blocks. */
const BLOCK_GUTTER = 4

export interface LaidOutBlock {
  key: string
  entry: TimelineEntry
  top: number
  height: number
  /** True when the block was floored to MIN_BLOCK_HEIGHT or pushed down. */
  stretched: boolean
}

export interface LaidOutGap {
  key: string
  top: number
  height: number
  minutes: number
}

export interface LaidOutUnavailable {
  block: AvailabilityBlock
  top: number
  height: number
}

export interface TimelineLayout {
  trackHeight: number
  hours: MinuteOfDay[]
  blocks: LaidOutBlock[]
  gaps: LaidOutGap[]
  unavailable: LaidOutUnavailable[]
  yOf: (minute: MinuteOfDay) => number
}

/**
 * Lays the day out in pixel space.
 *
 * Short blocks get floored to a readable height, which means a naive
 * `top = start * scale` can overlap the next block. So we sweep in
 * chronological order and push each block below the previous one's bottom
 * edge, then derive gap labels from the resulting boxes rather than from raw
 * minutes. That keeps the timeline proportional where it can be and legible
 * where it can't.
 */
export function layoutTimeline({
  windowStart,
  windowEnd,
  entries,
  unavailable,
}: {
  windowStart: MinuteOfDay
  windowEnd: MinuteOfDay
  entries: TimelineEntry[]
  unavailable: AvailabilityBlock[]
}): TimelineLayout {
  const yOf = (minute: MinuteOfDay) => (minute - windowStart) * PX_PER_MINUTE

  const ordered = [...entries].sort((a, b) => a.start - b.start || a.end - b.end)

  const blocks: LaidOutBlock[] = []
  const gaps: LaidOutGap[] = []
  let bottom = 0

  for (const entry of ordered) {
    const naturalTop = yOf(entry.start)
    const naturalHeight = (entry.end - entry.start) * PX_PER_MINUTE
    const height = Math.max(naturalHeight, MIN_BLOCK_HEIGHT)
    const top = Math.max(naturalTop, bottom + (blocks.length ? BLOCK_GUTTER : 0))

    // Only label the gap if there is real space AND real free time.
    const freeMinutes = entry.start - (blocks.length ? lastEnd(blocks) : windowStart)
    const gapPx = top - bottom
    if (gapPx >= MIN_LABELLED_GAP_PX && freeMinutes > 0) {
      gaps.push({
        key: `gap-${entry.start}`,
        top: bottom,
        height: gapPx,
        minutes: freeMinutes,
      })
    }

    blocks.push({
      key: entry.kind === 'event' ? entry.event.id : entry.task.id,
      entry,
      top,
      height,
      stretched: height > naturalHeight + 0.5,
    })
    bottom = top + height
  }

  // Trailing gap to the end of the window.
  const trailingMinutes = windowEnd - (blocks.length ? lastEnd(blocks) : windowStart)
  const trackHeight = Math.max(yOf(windowEnd), bottom)
  const trailingPx = trackHeight - bottom
  if (trailingPx >= MIN_LABELLED_GAP_PX && trailingMinutes > 0) {
    gaps.push({
      key: 'gap-trailing',
      top: bottom,
      height: trailingPx,
      minutes: trailingMinutes,
    })
  }

  const firstHour = Math.ceil(windowStart / 60)
  const lastHour = Math.floor(windowEnd / 60)
  const hours = Array.from(
    { length: Math.max(0, lastHour - firstHour + 1) },
    (_, i) => (firstHour + i) * 60,
  )

  const laidOutUnavailable = unavailable
    .filter((block) => block.startAt < windowEnd)
    .map((block) => {
      const end = Math.min(block.endAt ?? windowEnd, windowEnd)
      return {
        block,
        top: yOf(block.startAt),
        height: Math.max(0, yOf(end) - yOf(block.startAt)),
      }
    })

  return {
    trackHeight,
    hours,
    blocks,
    gaps,
    unavailable: laidOutUnavailable,
    yOf,
  }
}

function lastEnd(blocks: LaidOutBlock[]): MinuteOfDay {
  return blocks[blocks.length - 1].entry.end
}

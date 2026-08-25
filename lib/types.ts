/**
 * Frontend-facing mirror of the DayFlow Prisma schema.
 *
 * The one deliberate difference: times on the Today view are stored as
 * "minutes from local midnight" rather than absolute Date objects. The Today
 * screen only ever renders a single day, so a minute offset is all the
 * geometry needs — and it keeps server and client renders byte-identical
 * (no timezone/hydration drift). The API layer converts DateTime -> minute
 * offset once, at the boundary.
 */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SKIPPED'

export type EventSource = 'MANUAL' | 'TEXT' | 'IMAGE' | 'IMPORT' | 'SYSTEM'

export type ProposalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'PARTIALLY_ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'

/** Minutes elapsed since local midnight. 0 = 00:00, 570 = 09:30. */
export type MinuteOfDay = number

export interface Deadline {
  dueAt: MinuteOfDay
  /** 0 = today, 1 = tomorrow, and so on. */
  dueDayOffset: number
  strict: boolean
}

export interface FixedEvent {
  id: string
  kind: 'event'
  title: string
  description?: string
  startAt: MinuteOfDay
  endAt: MinuteOfDay
  location?: string
  priority: Priority
  source: EventSource
}

export interface FlexibleTask {
  id: string
  kind: 'task'
  title: string
  description?: string
  estimatedMinutes: number
  priority: Priority
  status: TaskStatus
  deadline?: Deadline
  /** Null when the task is still sitting in the backlog. */
  scheduledStartAt: MinuteOfDay | null
  scheduledEndAt: MinuteOfDay | null
  /** Set by the engine when this slot was chosen for a non-obvious reason. */
  scheduleReason?: string
}

export interface AvailabilityBlock {
  id: string
  type: 'AVAILABLE' | 'UNAVAILABLE'
  startAt: MinuteOfDay
  endAt: MinuteOfDay | null
  openEnded: boolean
  reason?: string
}

export interface PendingProposal {
  id: string
  status: ProposalStatus
  /** Count of items whose slot would change if accepted. */
  changeCount: number
  source: string
}

/** A single positioned entry on the Today timeline. */
export type TimelineEntry =
  | { kind: 'event'; start: MinuteOfDay; end: MinuteOfDay; event: FixedEvent }
  | { kind: 'task'; start: MinuteOfDay; end: MinuteOfDay; task: FlexibleTask }

export interface DaySnapshot {
  /** ISO date string for the day being rendered. */
  date: string
  dayLabel: string
  /** Bounds of the rendered timeline, e.g. 06:00 -> 23:00. */
  windowStart: MinuteOfDay
  windowEnd: MinuteOfDay
  events: FixedEvent[]
  tasks: FlexibleTask[]
  unavailable: AvailabilityBlock[]
  pendingProposal: PendingProposal | null
}

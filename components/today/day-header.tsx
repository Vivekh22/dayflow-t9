import Link from 'next/link'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import type { PendingProposal } from '@/lib/types'

interface DayHeaderProps {
  dayLabel: string
  scheduledCount: number
  backlogCount: number
  pendingProposal: PendingProposal | null
}

export function DayHeader({
  dayLabel,
  scheduledCount,
  backlogCount,
  pendingProposal,
}: DayHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {dayLabel}
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-balance">
          Today
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {scheduledCount} committed {scheduledCount === 1 ? 'block' : 'blocks'}
          {backlogCount > 0 ? ` · ${backlogCount} still in the backlog` : ''}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Quick add
        </button>
        <Link
          href="/replan"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Re-plan day
        </Link>
      </div>

      {pendingProposal ? (
        <Link
          href="/replan"
          className="group flex w-full items-center gap-3 rounded-xl border border-fixed/25 bg-fixed/8 px-4 py-3 transition-colors hover:bg-fixed/12"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-fixed"
          />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-medium">
              A new plan is waiting on you.
            </span>{' '}
            <span className="text-muted-foreground">
              Your availability changed, so the engine wants to move{' '}
              {pendingProposal.changeCount} blocks.
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-fixed">
            Review
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>
      ) : null}
    </header>
  )
}

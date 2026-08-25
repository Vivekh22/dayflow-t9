import Link from 'next/link'
import {
  CalendarRange,
  Flame,
  Inbox,
  ListTodo,
  Repeat2,
  Settings2,
  Sparkles,
  SunMedium,
} from 'lucide-react'

const primaryNav = [
  { href: '/today', label: 'Today', icon: SunMedium, active: true },
  { href: '/schedule', label: 'Schedule', icon: CalendarRange },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/routines', label: 'Routines', icon: Repeat2 },
  { href: '/habits', label: 'Habits', icon: Flame },
  { href: '/import', label: 'Import', icon: Inbox },
]

/**
 * Collapses to a 60px icon rail between `sm` and `lg`, so the nav never
 * disappears on laptop-ish widths where the timeline still needs the room.
 * Labels are kept in the DOM for screen readers at every size.
 */
export function AppSidebar({ pendingChanges }: { pendingChanges?: number }) {
  return (
    <aside className="relative z-20 hidden shrink-0 flex-col gap-1 border-r border-glass-border bg-glass p-3 backdrop-blur-xl sm:flex lg:w-60 lg:p-4">
      <Link
        href="/today"
        className="mb-6 flex items-center gap-2.5 px-1.5 py-1 lg:px-2"
        aria-label="DayFlow home"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30"
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
        </span>
        <span className="hidden text-[15px] font-semibold tracking-tight lg:inline">
          DayFlow
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5" aria-label="Main">
        {primaryNav.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
              active
                ? 'bg-glass-hover font-medium text-foreground'
                : 'text-muted-foreground hover:bg-glass-hover hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">{label}</span>
            <span className="sr-only lg:hidden">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="my-4 h-px bg-hairline" />

      <Link
        href="/replan"
        title="Re-plan"
        className="relative flex items-center gap-2.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="hidden lg:inline">Re-plan</span>
        <span className="sr-only lg:hidden">Re-plan</span>
        {pendingChanges ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[11px] leading-none text-primary-foreground lg:static lg:ml-auto">
            {pendingChanges}
          </span>
        ) : null}
      </Link>

      <div className="flex-1" />

      <Link
        href="/settings"
        title="Settings"
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-glass-hover hover:text-foreground"
      >
        <Settings2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden lg:inline">Settings</span>
        <span className="sr-only lg:hidden">Settings</span>
      </Link>

      <div className="mt-1 flex items-center gap-2.5 rounded-lg border-glass-border px-1 py-2 lg:border lg:bg-glass lg:px-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-medium"
        >
          VH
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block truncate text-xs font-medium">Vivek H</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Asia/Kolkata
          </span>
        </span>
      </div>
    </aside>
  )
}

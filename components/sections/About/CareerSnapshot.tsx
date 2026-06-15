interface CareerSnapshotProps {
  role: readonly string[]
  stats: readonly string[]
}

/**
 * 우측 Career Snapshot — 2차 §2.1.
 * 3개 블록: role / divider / stats.
 */
export function CareerSnapshot({ role, stats }: CareerSnapshotProps) {
  return (
    <div className="flex flex-col gap-14" data-career-snapshot>
      {/* Role */}
      <ul className="flex flex-col gap-2 font-mono text-body-l uppercase tracking-[0.04em] text-ink-inverse">
        {role.map(r => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      {/* Divider */}
      <div className="h-px w-8 bg-ink-inverse/40" />

      {/* Stats */}
      <ul className="flex flex-col gap-2 font-mono text-body-l uppercase tracking-[0.04em] text-ink-inverse">
        {stats.map(s => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

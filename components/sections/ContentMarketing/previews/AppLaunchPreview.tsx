import type { AppItem } from '@/lib/types/content'

interface Props {
  apps: AppItem[]
}

/**
 * App Launch 호버 preview — 앱 카드.
 * 아이콘 + QR + 메타 정보.
 */
export function AppLaunchPreview({ apps }: Props) {
  return (
    <div className="flex flex-col gap-10" data-preview="app-launch">
      {apps.map(app => (
        <article
          key={app.name}
          className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10"
        >
          {/* 아이콘 */}
          <div
            className="bg-ink-inverse/8 border-ink-inverse/15 size-24 shrink-0 overflow-hidden rounded-2xl border"
            aria-hidden
          />

          {/* QR */}
          <div className="flex flex-col items-start gap-2">
            <div
              className="size-28 shrink-0 bg-ink-inverse"
              aria-label={`QR for ${app.name}`}
            />
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-inverse/60">
              Scan to install
            </span>
          </div>

          {/* 메타 */}
          <div className="flex flex-1 flex-col gap-3">
            <h4 className="font-display text-display-m font-medium tracking-tight text-ink-inverse">
              {app.name}
            </h4>
            <div className="h-px w-8 bg-ink-inverse/40" />
            <p className="font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/60">
              Published on Google Play · {app.publishedDate}
            </p>
            {app.subtitle && (
              <p className="font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/60">
                {app.subtitle}
              </p>
            )}
            <a
              href={app.storeUrl}
              className="mt-4 inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.08em] text-ink-inverse"
            >
              <span>View on Play Store</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}

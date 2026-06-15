import type { ContentMedia } from '@/lib/types/content'

type Props = Extract<ContentMedia, { type: 'promotion-video' }>

/**
 * Promotion Video 호버 preview — 3블록 (INTENT / OUTPUT grid / PROCESS).
 * editorial 톤. 수치 라인 없음 — 사고력 + craft + 1인 워크플로우 어필.
 */
export function PromotionVideoPreview({ context, intent, videos, process, cta }: Props) {
  return (
    <div className="flex flex-col gap-10" data-preview="promotion-video">
      {/* Context (작은 라벨) */}
      <p className="font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/60">
        {context}
      </p>

      {/* ── INTENT ── */}
      <section>
        <Heading>Intent</Heading>
        <p className="mt-3 font-display text-heading italic leading-snug text-ink-inverse">
          “{intent}”
        </p>
      </section>

      {/* ── OUTPUT (영상 grid) ── */}
      <section>
        <Heading>Output</Heading>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {videos.map(v => (
            <div
              key={v.title}
              className="bg-ink-inverse/8 border-ink-inverse/15 relative overflow-hidden rounded-sm border"
              style={{ aspectRatio: '16 / 9' }}
              data-video-thumb
            >
              <span className="absolute inset-0 flex items-center justify-center font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/40">
                ▶
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS (5단계 화살표) ── */}
      <section>
        <Heading>Process</Heading>
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-label uppercase tracking-[0.08em] text-ink-inverse">
          {process.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="text-ink-inverse/40">
                  →
                </span>
              )}
              <span>{step}</span>
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <a
        href={cta.href}
        className="inline-flex items-center gap-2 self-start font-mono text-label uppercase tracking-[0.08em] text-ink-inverse"
      >
        <span>{cta.label}</span>
        <span aria-hidden>→</span>
      </a>
    </div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/45">
      ── {children}
    </h5>
  )
}

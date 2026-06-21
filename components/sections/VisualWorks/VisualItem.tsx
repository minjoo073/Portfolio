import type { VisualItem as VisualItemType } from '@/lib/types/content'

interface VisualItemProps {
  item: VisualItemType
  total: number
}

/**
 * Visual Works 1개 아이템 — *이미지 원본 비율 유지* + 높이 60vh 고정.
 *   - 너비 자동 (aspect 강제 X, object-cover crop X)
 *   - 포스터 = 자연 세로 비율 / 배너 = 자연 가로 비율
 *   - caption 은 이미지 아래 (img width 따라감)
 */
export function VisualItem({ item, total }: VisualItemProps) {
  const isPoster = item.category === 'poster'
  const indexLabel = `${String(item.index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const categoryLabel = isPoster ? 'Poster' : 'Banner'

  return (
    <article
      className="group flex shrink-0 flex-col gap-3"
      data-visual-item
      data-visual-id={item.id}
      data-category={item.category}
    >
      {/* 이미지 — 원본 비율 그대로, 높이 60vh, 너비 자동 (잘림 없음) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail}
        alt={`${item.title} — ${categoryLabel}`}
        className="block bg-dark-soft"
        style={{ height: '60vh', width: 'auto' }}
        loading="lazy"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />

      {/* hairline caption — V01 — Poster · 01 / 12 */}
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-inverse/55">
        <span>
          {item.title} <span className="text-ink-inverse/35">— {categoryLabel}</span>
        </span>
        <span>{indexLabel}</span>
      </div>
    </article>
  )
}

import type { VisualItem as VisualItemType } from '@/lib/types/content'
import { Placeholder } from '@/components/primitives/Placeholder'

interface VisualItemProps {
  item: VisualItemType
  total: number
}

/**
 * Visual Works 1개 아이템 — category에 따라 폭/비율 분기.
 *   poster: 4/5 portrait, clamp(220px, 22vw, 320px)
 *   banner: 16/9 landscape, clamp(360px, 36vw, 520px)
 *
 * 호버 시 인덱스 + category 라벨 노출 (가벼운 톤).
 */
export function VisualItem({ item, total }: VisualItemProps) {
  const isPoster = item.category === 'poster'

  const aspect = isPoster ? '4 / 5' : '16 / 9'
  const width = isPoster
    ? 'clamp(220px, 22vw, 320px)'
    : 'clamp(360px, 36vw, 520px)'

  const indexLabel = `${String(item.index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  const categoryLabel = isPoster ? 'POSTER' : 'BANNER'

  return (
    <article
      className="group flex shrink-0 flex-col gap-3"
      style={{ width }}
      data-visual-item
      data-visual-id={item.id}
      data-category={item.category}
    >
      <Placeholder
        label={indexLabel}
        aspect={aspect}
        className="h-auto bg-dark-soft"
      />

      {/* 메타 — 평소 인덱스만, 호버 시 카테고리 라벨 fade in */}
      <div className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.06em] text-ink-inverse">
        <span>{indexLabel}</span>
        <span className="text-ink-inverse/40 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          {categoryLabel}
        </span>
      </div>
    </article>
  )
}

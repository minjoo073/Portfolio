'use client'

import type { ContentGroup } from '@/lib/types/content'
import { cn } from '@/lib/utils/cn'

interface Props {
  groups: ContentGroup[]
  /** stage1: 큰 사이즈 viewport 가운데 / stage2: 작은 사이즈 좌측 */
  variant: 'stage1' | 'stage2'
  activeId?: string
  onHover?: (id: string) => void
}

/**
 * 영수증 — 3 그룹, 영수증 톤 풍부.
 * 헤더 2줄 (브랜드 + 카테고리/기간)
 * 본문: 그룹 라벨 ─── 메타 (가격표 leader 톤)
 * 푸터 2줄 (TOTAL + SUMMARY)
 *
 * variant:
 *   stage1: 큰 사이즈, hover X — 시각 임팩트 우선
 *   stage2: 작은 사이즈, hover → onHover 콜백
 */
export function Receipt({ groups, variant, activeId, onHover }: Props) {
  const isStage1 = variant === 'stage1'

  const width = isStage1
    ? 'clamp(320px, 60vw, 780px)'
    : 'clamp(280px, 32vw, 460px)'

  return (
    <div
      className="relative bg-white text-ink-primary"
      style={{
        width,
        transform: 'rotate(-1.5deg)',
        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.32)'
      }}
      data-receipt
      data-variant={variant}
    >
      {/* ─── 헤더 (3줄) ─── */}
      <div className="border-b border-dashed border-ink-primary/25 px-8 py-6 md:px-12 md:py-8">
        <p className="font-mono text-label uppercase tracking-[0.12em] text-ink-muted">
          PARK MINJOO / RECORD
        </p>
        <p className="mt-1 font-mono text-label uppercase tracking-[0.12em] text-ink-muted/70">
          Issued · 2026
        </p>
        <p className="mt-1 font-mono text-label uppercase tracking-[0.12em] text-ink-muted/70">
          Category · Content &amp; Marketing
        </p>
      </div>

      {/* ─── 본문 ─── */}
      <div className="px-8 py-10 md:px-12 md:py-14">
        <ul className="flex flex-col gap-10 md:gap-14">
          {groups.map(group => {
            const isActive = group.id === activeId
            return (
              <li
                key={group.id}
                className={cn(
                  'group flex flex-col gap-3 transition-opacity duration-300 ease-out',
                  !isStage1 && (isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'),
                  !isStage1 && 'cursor-pointer'
                )}
                onMouseEnter={isStage1 ? undefined : () => onHover?.(group.id)}
                data-group-id={group.id}
                data-active={isActive || undefined}
              >
                {/* 상단 행: index + label + leader + meta */}
                <div className="flex items-baseline gap-4">
                  <span className="shrink-0 font-mono text-label uppercase tracking-[0.06em] text-ink-muted">
                    {group.index}
                  </span>
                  <span
                    className={cn(
                      'font-display font-medium leading-[1.05] tracking-tight',
                      isStage1 ? 'text-display-m' : 'text-heading'
                    )}
                  >
                    {group.label}
                  </span>
                  <span
                    aria-hidden
                    className="mx-2 flex-1 self-end border-b border-dotted border-ink-primary/30"
                    style={{ marginBottom: isStage1 ? '0.6em' : '0.45em' }}
                  />
                  <span className="shrink-0 font-mono text-label uppercase tracking-[0.08em] text-ink-muted">
                    {group.receiptMeta}
                  </span>
                </div>

                {/* sub-lines (라벨 아래 들여쓰기) */}
                <ul className="ml-8 flex flex-col gap-1 md:ml-12">
                  {group.subLines.map((line, i) => (
                    <li
                      key={i}
                      className="font-mono text-label uppercase tracking-[0.08em] text-ink-muted/75"
                    >
                      └ {line}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ─── 푸터 (4줄) ─── */}
      <div className="border-t border-dashed border-ink-primary/25 px-8 py-6 md:px-12 md:py-8">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-muted">
            Total
          </span>
          <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-muted">
            {groups.length} entries
          </span>
        </div>
        <p className="mt-1 font-mono text-label uppercase tracking-[0.12em] text-ink-muted/70">
          Solo run · Multi-role
        </p>
        <p className="mt-1 font-mono text-label uppercase tracking-[0.12em] text-ink-muted/70">
          Signed · Park Minjoo
        </p>
        <p className="mt-3 font-mono text-label uppercase tracking-[0.12em] text-ink-muted/50">
          TX · PM-2026-CM-{String(groups.length).padStart(3, '0')}
        </p>
      </div>

      {/* 하단 톱니 */}
      <div
        className="absolute -bottom-3 left-0 right-0 h-3"
        style={{
          backgroundImage:
            'radial-gradient(circle at 8px 0, white 6px, transparent 6.5px)',
          backgroundSize: '16px 12px',
          backgroundRepeat: 'repeat-x'
        }}
        aria-hidden
      />
    </div>
  )
}

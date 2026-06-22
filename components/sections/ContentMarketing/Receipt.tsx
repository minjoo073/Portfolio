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
    ? 'clamp(280px, 42vw, 540px)'
    : 'clamp(320px, 40vw, 640px)'

  return (
    <div
      className="relative bg-white text-ink-primary"
      style={{
        width,
        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.32)',
      }}
      data-receipt
      data-variant={variant}
    >
      {/* ─── 헤더 (3줄) — L2: 영수증 정보 ─── */}
      <div
        className={cn(
          'border-b border-dashed border-ink-primary/25 px-6 md:px-8',
          isStage1 ? 'py-5 md:py-6' : 'py-8 md:py-12'
        )}
      >
        <p data-cm-receipt-line className={cn(
          'font-mono uppercase tracking-[0.12em] text-ink-primary',
          isStage1 ? 'text-sm' : 'text-sm md:text-[15px]'
        )}>
          PARK MINJOO / RECORD
        </p>
        <p data-cm-receipt-line className={cn(
          'mt-2 font-kr tracking-[0.02em] text-ink-muted/80',
          isStage1 ? 'text-label' : 'text-label md:text-[12.5px]'
        )}>
          발행 · 2026
        </p>
        <p data-cm-receipt-line className={cn(
          'mt-1 font-kr tracking-[0.02em] text-ink-muted/80',
          isStage1 ? 'text-label' : 'text-label md:text-[12.5px]'
        )}>
          카테고리 · 콘텐츠 &amp; 마케팅
        </p>
      </div>

      {/* ─── 본문 ─── */}
      <div className={cn('px-6 md:px-8', isStage1 ? 'py-6 md:py-8' : 'py-8 md:py-12')}>
        <ul className={cn('flex flex-col', isStage1 ? 'gap-4 md:gap-5' : 'gap-8 md:gap-12')}>
          {groups.map(group => {
            const isActive = group.id === activeId
            return (
              <li
                key={group.id}
                className={cn(
                  'group flex flex-col transition-opacity duration-700 ease-out gap-1.5',
                  !isStage1 && (isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'),
                  !isStage1 && 'cursor-pointer'
                )}
                onMouseEnter={isStage1 ? undefined : () => onHover?.(group.id)}
                data-group-id={group.id}
                data-active={isActive || undefined}
              >
                {/* 상단 행: index + label + leader + meta */}
                <div data-cm-receipt-line className="flex items-baseline gap-4">
                  <span className="shrink-0 font-mono text-label tracking-[0.06em] text-ink-muted/80">
                    {group.index}
                  </span>
                  <span
                    className={cn(
                      'font-display font-medium leading-[1.05] tracking-tight',
                      isStage1
                        ? 'text-[clamp(22px,2.6vw,38px)]'
                        : 'text-[clamp(22px,2.2vw,30px)]'
                    )}
                  >
                    {group.label}
                  </span>
                  <span
                    aria-hidden
                    className="mx-2 flex-1 self-end border-b border-dotted border-ink-primary/30"
                    style={{ marginBottom: isStage1 ? '0.6em' : '0.45em' }}
                  />
                  <span className="shrink-0 font-kr text-label tracking-[0.04em] text-ink-muted">
                    {group.receiptMeta}
                  </span>
                </div>

                {/* sub-lines (라벨 아래 들여쓰기) — L4: 가장 작은 메타 */}
                <ul className={cn(
                  'flex flex-col',
                  isStage1 ? 'ml-8 gap-1 md:ml-12' : 'ml-8 gap-2.5 md:ml-10'
                )}>
                  {group.subLines.map((line, i) => (
                    <li
                      key={i}
                      data-cm-receipt-line
                      className={cn(
                        'font-kr tracking-[0.02em] text-ink-muted/70',
                        isStage1
                          ? 'text-[11px] md:text-xs'
                          : 'text-xs md:text-sm'
                      )}
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

      {/* ─── 푸터 — Total 이하 영문 (영수증 톤 유지) ─── */}
      <div
        className={cn(
          'border-t border-dashed border-ink-primary/25 px-6 md:px-8',
          isStage1 ? 'py-5 md:py-6' : 'py-8 md:py-12'
        )}
      >
        <div data-cm-receipt-line className="flex items-baseline justify-between gap-4">
          <span className={cn(
            'font-mono uppercase tracking-[0.12em] text-ink-primary',
            isStage1 ? 'text-sm' : 'text-sm md:text-[15px]'
          )}>
            Total
          </span>
          <span className={cn(
            'font-mono uppercase tracking-[0.12em] text-ink-primary',
            isStage1 ? 'text-sm' : 'text-sm md:text-[15px]'
          )}>
            {groups.length} entries
          </span>
        </div>
        <p data-cm-receipt-line className={cn(
          'mt-1.5 font-mono uppercase tracking-[0.12em] text-ink-muted/80',
          isStage1 ? 'text-label' : 'text-label md:text-[12.5px]'
        )}>
          Solo run · Multi-role
        </p>
        <p data-cm-receipt-line className={cn(
          'mt-0.5 font-mono uppercase tracking-[0.12em] text-ink-muted/70',
          isStage1 ? 'text-label' : 'text-label md:text-[12.5px]'
        )}>
          Signed · Park Minjoo · PM-2026-CM-{String(groups.length).padStart(3, '0')}
        </p>
      </div>

    </div>
  )
}

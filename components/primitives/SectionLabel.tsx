import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

/**
 * 섹션 좌상단 라벨 — `(About Me)`, `(Featured Web Projects)` 등.
 * 모든 섹션에서 재사용.
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'text-ink-muted font-mono text-label uppercase tracking-[0.08em]',
        className
      )}
      data-section-label
    >
      ({children})
    </p>
  )
}

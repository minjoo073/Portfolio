import { cn } from '@/lib/utils/cn'

interface PlaceholderProps {
  /** 인덱스 표기 — "01 / 07" 형식 */
  label?: string
  /** aspect ratio CSS */
  aspect?: string
  className?: string
}

/**
 * 콘텐츠가 들어올 자리 — 회색 박스 + 인덱스 표기.
 * 실제 이미지는 후속 단계에서 next/image로 교체.
 */
export function Placeholder({ label, aspect = '16 / 9', className }: PlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-sm',
        'bg-[#E8E6E0]',
        'flex items-center justify-center',
        className
      )}
      style={{ aspectRatio: aspect }}
      data-placeholder
    >
      {label && (
        <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-muted/60">
          {label}
        </span>
      )}
    </div>
  )
}

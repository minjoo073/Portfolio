interface ProgressBarProps {
  total: number
}

/**
 * 가로 트랙 진행도 표시 — 하단 중앙.
 * Phase 2: 정적 — 첫 segment 채워진 상태로 placeholder
 * Phase 3: GSAP가 스크롤 진행에 따라 채워진 segment를 이동.
 */
export function ProgressBar({ total }: ProgressBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-[5vh] left-1/2 -translate-x-1/2" data-progress>
      <div className="flex items-center gap-[6px]">
        {/* 채워진 segment (현재 활성) */}
        <div
          className="h-[10px] border border-ink-inverse/50"
          style={{ width: 56 }}
          data-progress-fill
        />
        {/* 나머지 tick marks */}
        {Array.from({ length: Math.max(0, total - 1) }).map((_, i) => (
          <div key={i} className="h-[10px] w-px bg-ink-inverse/40" data-progress-tick />
        ))}
      </div>
    </div>
  )
}

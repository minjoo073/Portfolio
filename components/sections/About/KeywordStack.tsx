interface KeywordStackProps {
  keywords: readonly string[]
}

/**
 * 좌측 대형 키워드 스택 — 2차 §2.1.
 * Phase 2: 정적 배치 (모두 보임). Phase 3에서 겹침 → 분해 모션 적용.
 */
export function KeywordStack({ keywords }: KeywordStackProps) {
  return (
    <div className="font-display flex flex-col gap-2" data-keyword-stack>
      {keywords.map(word => (
        <span
          key={word}
          className="text-display-m font-medium leading-[0.92] tracking-tight text-ink-inverse"
          data-keyword={word}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

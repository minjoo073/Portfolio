import { visualWorks } from '@/data/visualWorks'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { VisualItem } from './VisualItem'

/**
 * Visual Works 섹션 — 2차 §6.
 *
 * Phase 2 단계: 수평 overflow-x-auto 컨테이너로 placeholder.
 *   - 데스크탑에서는 휠로 수평 스크롤 불가 (네이티브) → 트랙패드/드래그로 가능
 *   - Phase 3에서 GSAP pin + scroll-driven x-translation 적용 → 휠로 수평 진행
 *
 * 가변: K × 50vw 트랙 길이.
 */
export function VisualWorks() {
  const total = visualWorks.length

  return (
    <section
      id="visual"
      className="relative min-h-[100vh] bg-dark text-ink-inverse py-[8vh]"
      data-section="visual-works"
    >
      <div className="px-side-m md:px-side-t xl:px-side-d">
        <SectionLabel className="text-ink-inverse/70">Visual Works</SectionLabel>
      </div>

      {/* 수평 트랙 — Phase 3에서 pin orchestrator로 wrapping */}
      <div
        className="mt-[6vh] flex gap-gutter-d overflow-x-auto px-side-m md:px-side-t xl:px-side-d"
        data-horizontal-track
        style={{ scrollbarWidth: 'thin' }}
      >
        {visualWorks.map(item => (
          <VisualItem key={item.id} item={item} total={total} />
        ))}
      </div>
    </section>
  )
}

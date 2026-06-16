import { mobile } from '@/data/mobile'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { MobileCard } from './MobileCard'

/**
 * Mobile Projects 섹션 — 강디 E안 비대칭 (가로 dual portrait).
 *
 * 구조:
 *   10vh 라벨
 *   80vh dual-portrait (좌 60% featured + 우 40% archive)
 *   10vh 전환 여백
 *
 * 다크 톤 한 단 더 어둡게(RayRayLab 라이트→다크→라이트 곡선의 바닥)는
 * 별도 토큰 결정 후 적용.
 */
export function MobileProjects() {
  const featured = mobile.find((m) => m.displayType === 'featured')
  const archive = mobile.find((m) => m.displayType === 'archive')

  return (
    <section
      id="mobile"
      className="relative bg-dark text-ink-inverse px-side-m md:px-side-t xl:px-side-d"
      data-section="mobile-projects"
    >
      {/* 라벨 10vh */}
      <div className="flex h-[10vh] items-end pb-[2vh]">
        <SectionLabel className="text-ink-inverse/70">Mobile Projects</SectionLabel>
      </div>

      {/* dual-portrait 80vh */}
      <div className="flex h-[80vh] items-center gap-12" data-cards-wrapper>
        {/* 좌 60% featured */}
        <div className="flex w-3/5 items-center justify-center">
          {featured && <MobileCard project={featured} variant="featured" />}
        </div>
        {/* 우 40% archive */}
        <div className="flex w-2/5 items-center justify-center">
          {archive && <MobileCard project={archive} variant="archive" />}
        </div>
      </div>

      {/* 전환 여백 10vh */}
      <div className="h-[10vh]" aria-hidden />
    </section>
  )
}

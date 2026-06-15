import { projects } from '@/data/projects'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { ProjectCard } from './ProjectCard'
import { ProgressBar } from './ProgressBar'

/**
 * Web Projects 섹션 — 가로 트랙 (Horizontal Layout).
 * 사용자 처음 명세대로 horizontal scrolling 카드 흐름.
 *
 * 구조:
 *   <section bg-dark>
 *     <SectionLabel> 좌상단
 *     <Track horizontal> 카드 N개 가로 정렬
 *     <ProgressBar> 하단 중앙
 *   </section>
 *
 * Phase 2 (지금):
 *   - 섹션 자체는 100vh 단일 viewport
 *   - 트랙은 `overflow-x-auto` 폴백 (트랙패드 가로 스크롤 가능)
 *
 * Phase 3 (GSAP):
 *   - section pin 100vh
 *   - 트랙 x-translation을 수직 스크롤에 종속
 *   - ProgressBar fill 위치 = 진행도 × (총 폭 − fill 폭)
 *   - 카드 reveal (clip-path), hover, 진입/이탈 parallax
 *   - 카드 클릭 → /projects#projectN 페이지 전환
 *
 * 가변 확장: data/projects.ts 배열에 push 하면 트랙 폭 자동 증가.
 */
export function WebProjects() {
  return (
    <section
      id="work"
      className="relative h-screen-dvh w-full overflow-hidden bg-dark"
      data-section="web-projects"
      data-pin-target
    >
      {/* 라벨 — 좌상단 */}
      <div className="absolute left-side-m top-[8vh] z-10 md:left-side-t xl:left-side-d">
        <SectionLabel className="text-ink-inverse/60">Featured Work</SectionLabel>
      </div>

      {/* 가로 트랙 */}
      <div
        className="absolute inset-0 flex items-center gap-gutter-d overflow-x-auto px-side-m md:px-side-t xl:px-side-d"
        data-horizontal-track="web-projects"
      >
        {/* 좌측 시작 spacer — 라벨 영역 회피 */}
        <div className="h-1 shrink-0" style={{ width: 'clamp(40px, 6vw, 120px)' }} aria-hidden />

        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* 우측 끝 spacer — 마지막 카드와 viewport 우측 사이 여유 */}
        <div className="h-1 shrink-0" style={{ width: 'clamp(40px, 6vw, 120px)' }} aria-hidden />
      </div>

      {/* 진행도 — 하단 중앙 */}
      <ProgressBar total={projects.length} />
    </section>
  )
}

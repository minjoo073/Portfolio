import type { Project } from '@/lib/types/project'

interface ProjectCardProps {
  project: Project
  total: number
}

/**
 * Web Project 카드 — fullwidth landscape, 세로 스택 전용.
 * 카드 1장 = 70vh. Visual은 true fullbleed (좌우 side margin 없음).
 * GSAP 애니메이션은 WebProjects.tsx의 useGsapContext에서 주입.
 *
 * 데이터 속성 구조 (GSAP 셀렉터 타깃):
 *   [data-card]           — 카드 루트 (ScrollTrigger trigger)
 *   [data-meta]           — 메타 행 (date, category children)
 *   [data-index]          — "01 / 07" 인덱스
 *   [data-visual-wrapper] — clip-path 애니메이션 컨테이너
 *   [data-visual]         — scale 애니메이션 내부 요소
 *   [data-title]          — 타이틀 (clip-path L→R, 이탈 parallax)
 *
 * studyHref 없는 카드: pointer-events-none, aria-disabled, tabIndex -1.
 */
export function ProjectCard({ project, total }: ProjectCardProps) {
  const href = project.studyHref
  const isDisabled = !href

  const totalStr = String(total).padStart(2, '0')

  return (
    <article
      className="relative h-[70vh] w-full"
      data-card
      data-project-id={project.id}
    >
      <a
        href={href ?? '#'}
        className={`group relative block h-full w-full${isDisabled ? ' pointer-events-none' : ''}`}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        data-card-link
      >
        {/* ── Meta — 좌상단 grid margin, top 4vh ── */}
        <div
          className="absolute left-side-m top-[4vh] z-10 flex items-center gap-6 md:left-side-t xl:left-side-d"
          data-meta
        >
          <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-muted">
            {project.date}
          </span>
          <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-muted">
            {project.category}
          </span>
        </div>

        {/* ── Index — 우상단 grid margin, top 4vh ── */}
        <div
          className="absolute right-side-m top-[4vh] z-10 md:right-side-t xl:right-side-d"
          data-index
        >
          <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-muted opacity-60">
            {project.index} / {totalStr}
          </span>
        </div>

        {/* ── Visual — fullbleed (side margin 없음), top 8vh, 56vh ── */}
        {/* clip-path 는 wrapper에, scale 은 inner에 적용 */}
        <div
          className="absolute inset-x-0 top-[8vh] h-[56vh]"
          data-visual-wrapper
        >
          {/* will-change: transform — GPU 가속 (hover scale도 여기서) */}
          <div
            className="h-full w-full bg-[#E8E6E0] transition-[filter] duration-300 group-hover:brightness-[1.04]"
            style={{ willChange: 'transform' }}
            data-visual
          >
            {/* 이미지 자리 placeholder — 인덱스 워터마크 */}
            <span className="absolute inset-0 flex items-center justify-center font-mono text-display-m font-medium uppercase tracking-[0.06em] text-ink-primary/[0.12]">
              {project.index}
            </span>
          </div>
        </div>

        {/* ── Title — 좌하단 grid margin, bottom 4vh, display-L ── */}
        {/* hover: x +12px (Tailwind group-hover translate) */}
        <h3
          className="absolute bottom-[4vh] left-side-m z-10 font-display text-display-l font-medium tracking-tight text-ink-primary transition-transform duration-300 ease-out group-hover:translate-x-3 md:left-side-t xl:left-side-d"
          data-title
        >
          {project.title}
        </h3>

        {/* ── Disabled overlay (no studyHref) ── */}
        {isDisabled && (
          <div
            className="absolute right-side-m bottom-[4vh] z-10 font-mono text-label uppercase tracking-[0.06em] text-ink-muted/40 md:right-side-t xl:right-side-d"
            aria-hidden
          >
            Coming soon
          </div>
        )}
      </a>
    </article>
  )
}

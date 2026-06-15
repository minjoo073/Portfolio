import type { Project } from '@/lib/types/project'

interface ProjectCardProps {
  project: Project
}

/**
 * Web Project 카드 — 세로(portrait) 카드, 풀-바디 visual.
 * 가로 트랙 안에서 shrink-0 으로 배치.
 *
 * 구조:
 *   - 풀카드 visual placeholder (cover)
 *   - 상단 중앙 title overlay
 *   - 하단 중앙 date + category overlay
 *
 * Phase 3에서:
 *   - clip-path reveal (R→L 또는 B→T)
 *   - hover 시 scale 1.02
 *   - 카드 진입/이탈 parallax
 *   - 클릭 → /projects#projectN 페이지 전환
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article
      className="relative shrink-0"
      style={{
        width: 'clamp(280px, 26vw, 460px)',
        height: '76vh'
      }}
      data-card
      data-project-id={project.id}
    >
      <a
        href={`/projects${project.detailAnchor}`}
        className="group relative block h-full w-full overflow-hidden"
        data-card-link
      >
        {/* Full-card visual placeholder */}
        <div
          className="absolute inset-0 bg-[#1A1A1A] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          data-visual
          aria-label={`Visual placeholder for ${project.title}`}
        >
          {/* placeholder 인덱스 (이미지 자리) */}
          <span className="absolute inset-0 flex items-center justify-center font-mono text-display-m font-medium uppercase tracking-[0.06em] text-ink-inverse/15">
            {project.index}
          </span>
        </div>

        {/* Title overlay — 상단 중앙 */}
        <h3
          className="absolute left-1/2 top-[6vh] -translate-x-1/2 font-display text-heading font-medium tracking-tight text-ink-inverse"
          data-title
        >
          {project.title}
        </h3>

        {/* Meta overlay — 하단 중앙 */}
        <div
          className="absolute bottom-[5vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-center font-mono text-label uppercase tracking-[0.06em] text-ink-inverse"
          data-meta
        >
          <span>{project.date}</span>
          <span>{project.category}</span>
        </div>
      </a>
    </article>
  )
}

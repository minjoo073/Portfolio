import type { Project } from '@/lib/types/project'
import { cn } from '@/lib/utils/cn'

interface MobileCardProps {
  project: Project
  index: number // 0-based, alternate 결정용
}

/**
 * Mobile Project 카드 — 2차 §4.
 * 60vh 모듈. alternate: 홀수 카드는 mock 좌측, 짝수는 우측.
 * Phase 3에서 x-translation reveal, mock hover lift.
 */
export function MobileCard({ project, index }: MobileCardProps) {
  const mockOnRight = index % 2 === 1

  return (
    <article
      className="relative grid h-[60vh] grid-cols-12 items-center gap-gutter-d py-[4vh]"
      data-card
      data-mobile-id={project.id}
    >
      {/* Device mock placeholder — 9:19.5 비율 */}
      <div
        className={cn(
          'col-span-12 md:col-span-4',
          mockOnRight ? 'md:order-2 md:col-start-9' : 'md:order-1 md:col-start-2'
        )}
        data-mock
      >
        <div
          className="relative mx-auto h-full max-h-[48vh] overflow-hidden rounded-[28px] bg-[#1A1A1A]"
          style={{ aspectRatio: '9 / 19.5' }}
        >
          <span className="absolute inset-0 flex items-center justify-center font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/30">
            {project.index}
          </span>
        </div>
      </div>

      {/* 텍스트 블록 */}
      <div
        className={cn(
          'col-span-12 flex flex-col gap-6 md:col-span-5',
          mockOnRight ? 'md:order-1 md:col-start-2' : 'md:order-2 md:col-start-7'
        )}
        data-text-block
      >
        {/* Meta */}
        <div className="flex items-center gap-3 font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/60">
          <span>{project.index}</span>
          <span aria-hidden>·</span>
          <span>{project.category}</span>
          <span aria-hidden>·</span>
          <span>{project.date}</span>
        </div>

        {/* Title */}
        <h3
          className="font-display text-display-m font-medium tracking-tight text-ink-inverse"
          data-title
        >
          {project.title}
        </h3>

        {/* Description placeholder */}
        <p className="max-w-[320px] text-body-l font-kr leading-relaxed text-ink-inverse/70">
          모바일 프로젝트 설명이 들어갈 자리입니다.
          <br />
          제작 과정, 도전 과제, 결과 등 2~3줄로.
        </p>

        {/* Divider */}
        <div className="h-px w-8 bg-ink-inverse/40" />

        {/* View Detail */}
        <a
          href={`/projects${project.detailAnchor}`}
          className="group inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.08em] text-ink-inverse"
          data-detail-link
        >
          <span className="transition-[font-weight] group-hover:font-semibold">View Detail</span>
          <span
            aria-hidden
            className="inline-block w-2 transition-all duration-300 ease-out group-hover:w-4"
          >
            →
          </span>
        </a>
      </div>
    </article>
  )
}

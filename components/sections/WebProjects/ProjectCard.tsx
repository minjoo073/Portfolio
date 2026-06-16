'use client'

import { useRef } from 'react'
import type { Project } from '@/lib/types/project'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'

interface ProjectCardProps {
  project: Project
  total: number
}

/**
 * Web Project 카드 — C안 Asymmetric Split + 진입 reveal + 호버 tilt.
 *
 * 레이아웃 (90vh):
 *   좌 40% 메타 패널: date · category / subline / title / 진입 옵션
 *   우 60% 비주얼: 16:9 landscape (1920×1080 hero 캡처 기준)
 *
 * 모션:
 *   진입(GSAP scrollTrigger via WebProjects.tsx): clip-path L→R wipe + scale 1.08→1
 *   호버(이 컴포넌트): scale 1.04 + brightness 1.08 + 마우스 따라 3D tilt(±3°)
 *   이탈(GSAP): 살짝 떠오르며 흐려짐
 *
 * featured vs archive:
 *   featured(5개): brightness 1.0, View Site + View Case 진입점 2개
 *   archive(06/07): brightness 0.85, View Site + "Case in archive" 1개+라벨
 *
 * 데이터 속성 (GSAP 셀렉터):
 *   [data-card] / [data-meta] / [data-index] / [data-visual-wrapper] / [data-visual] / [data-title]
 */
export function ProjectCard({ project, total }: ProjectCardProps) {
  const isArchive = project.displayType === 'archive'
  const totalStr = String(total).padStart(2, '0')
  const reduced = useReducedMotionContext()
  const visualRef = useRef<HTMLDivElement>(null)

  // 마우스 따라 3D tilt — perspective 1000, max ±3°
  function handleMouseMove(e: React.MouseEvent) {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotY = ((x / rect.width) - 0.5) * 6   // -3 ~ 3
    const rotX = -((y / rect.height) - 0.5) * 6
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`
  }
  function handleMouseLeave() {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    el.style.transform = ''
  }

  return (
    <article
      className="relative h-[90vh] w-full"
      data-card
      data-project-id={project.id}
      data-display-type={project.displayType}
    >
      <div className="flex h-full w-full">
        {/* ── 좌 40% 메타 패널 ────────────────────────────────────── */}
        <div className="flex w-2/5 flex-col justify-between px-side-m py-[8vh] md:px-side-t xl:px-side-d">
          {/* 상단: date · category · workType · 인덱스 (모두 mono 인라인 — 배지 박스 폐기) */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/60"
              data-meta
            >
              <span>{project.date}</span>
              <span className="text-ink-inverse/30">·</span>
              <span>{project.category}</span>
              <span className="text-ink-inverse/30">·</span>
              <span
                className={
                  project.workType === 'original'
                    ? 'text-ink-inverse tracking-[0.2em]'
                    : 'text-ink-inverse/45 tracking-[0.2em]'
                }
              >
                {project.workType === 'original' ? 'Original' : 'Redesign'}
              </span>
            </div>
            <span
              className="font-mono text-label uppercase tracking-[0.06em] text-ink-inverse/40"
              data-index
            >
              {project.index} / {totalStr}
            </span>
          </div>

          {/* 하단: title → subline → 진입 옵션 (강디 1픽 순서) */}
          <div>
            <h3
              className="mb-5 font-display tracking-tight leading-[0.92] text-ink-inverse"
              style={{
                // PP Editorial New 의 진짜 매력 = Regular (400) + 작은 사이즈. 신입 톤 거대 statement 부담 해소.
                fontSize: 'clamp(48px, 8vw, 96px)',
                fontWeight: 400,
                willChange: 'transform, opacity',
              }}
              data-title
            >
              {project.title}
            </h3>
            <p className="mb-8 max-w-md font-sans text-[14px] leading-relaxed text-ink-inverse/60 tracking-tight">
              {project.subline}
            </p>

            {/* 진입 옵션 — View Site + View Case (case 페이지 ↳ TURN PAGE 와 동일 시각 언어) */}
            <div className="flex flex-col gap-5">
              {/* View Site — 7개 모두 */}
              {project.siteHref ? (
                <a
                  href={project.siteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/site inline-flex items-center gap-4"
                >
                  <span className="h-px w-6 bg-ink-inverse/60 transition-[width,background-color] duration-500 ease-out group-hover/site:w-14 group-hover/site:bg-ink-inverse" />
                  <span className="font-mono text-[18px] uppercase tracking-[0.18em] text-ink-inverse/80 group-hover/site:text-ink-inverse transition-colors duration-300">
                    View Site
                  </span>
                  <span className="inline-block font-mono text-[18px] text-ink-inverse/60 group-hover/site:text-ink-inverse transition-[transform,color] duration-300 group-hover/site:translate-x-1 group-hover/site:-translate-y-0.5">
                    ↗
                  </span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-4">
                  <span className="h-px w-6 bg-ink-inverse/30" />
                  <span className="font-mono text-[18px] uppercase tracking-[0.18em] text-ink-inverse/40">
                    View Site
                  </span>
                  <span className="font-mono text-[14px] uppercase tracking-[0.16em] text-ink-inverse/30">
                    — SOON
                  </span>
                </span>
              )}

              {/* View Case — featured 5개만 */}
              {project.studyHref ? (
                <a
                  href={project.studyHref}
                  className="group/case inline-flex items-center gap-4"
                >
                  <span className="h-px w-6 bg-ink-inverse/60 transition-[width,background-color] duration-500 ease-out group-hover/case:w-14 group-hover/case:bg-ink-inverse" />
                  <span className="font-mono text-[18px] uppercase tracking-[0.18em] text-ink-inverse/80 group-hover/case:text-ink-inverse transition-colors duration-300">
                    View Case
                  </span>
                  <span className="inline-block font-mono text-[18px] text-ink-inverse/60 group-hover/case:text-ink-inverse transition-[transform,color] duration-300 group-hover/case:translate-x-1">
                    →
                  </span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-4">
                  <span className="h-px w-6 bg-ink-inverse/20" />
                  <span className="font-mono text-[18px] uppercase tracking-[0.18em] text-ink-inverse/35">
                    Case in archive
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── 우 60% 비주얼 ───────────────────────────────────────── */}
        <div className="flex w-3/5 items-center justify-center px-side-m py-[8vh] md:px-side-t xl:px-side-d">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '16 / 9' }}
            data-visual-wrapper
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={visualRef}
              // -inset-px 로 1px overscan → GSAP clip-path · scale 보간의 sub-pixel anti-aliasing 라인 차단
              className="absolute -inset-px bg-dark-soft transition-[transform,filter] duration-500 ease-out"
              style={{
                // 파일 없으면 dark-soft placeholder + 워터마크만 보임 (404는 무시)
                backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'transform',
                filter: isArchive ? 'brightness(0.85)' : undefined,
              }}
              data-visual
            />

          </div>
        </div>
      </div>
    </article>
  )
}

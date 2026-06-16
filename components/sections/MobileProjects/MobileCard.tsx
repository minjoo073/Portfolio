'use client'

import { useEffect, useRef } from 'react'
import type { Project } from '@/lib/types/project'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'

interface MobileCardProps {
  project: Project
  /** 'featured' (좌 60%) vs 'archive' (우 40%) — 비대칭 위계 */
  variant: 'featured' | 'archive'
}

/**
 * Mobile Project 카드 — 강디 E안 비대칭.
 *
 * featured (좌 60%, 큰 폰):
 *   - 폰 mockup height ~64vh, 1px outline only
 *   - video autoplay loop (19.5:9)
 *   - brightness 1.0
 *   - 메타 4줄 (date · category, subline, title, 진입 옵션 2개)
 *
 * archive (우 40%, 작은 폰 70% 크기):
 *   - 폰 mockup height ~45vh
 *   - brightness 0.78
 *   - 메타 1줄 (title + Site 진입 옵션)
 *
 * video 자동재생:
 *   - playsinline + muted + loop + autoplay (Safari iOS 정책)
 *   - preload="none" + poster (CLS 방지)
 *   - IntersectionObserver: viewport 진입 시 play, 이탈 시 pause+rewind
 *   - reduced motion: video 정지 + poster 표시
 */
export function MobileCard({ project, variant }: MobileCardProps) {
  const reduced = useReducedMotionContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver — viewport 50% 진입 시 재생, 이탈 시 정지
  useEffect(() => {
    if (reduced) return
    const wrapper = wrapperRef.current
    const video = videoRef.current
    if (!wrapper || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // autoplay 정책 실패 — silent
          })
        } else {
          video.pause()
          video.currentTime = 0
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [reduced])

  const isFeatured = variant === 'featured'
  const brightness = isFeatured ? 1 : 0.78
  const mockupHeight = isFeatured ? '64vh' : '45vh'
  // 메타 영역 — featured 만 진입 옵션 노출 (강디 E안: archive는 한 줄)
  const showSubline = isFeatured
  const showCaseEntry = isFeatured && !!project.studyHref

  return (
    <article
      ref={wrapperRef}
      className="flex flex-col items-center gap-6"
      data-card
      data-project-id={project.id}
      data-variant={variant}
    >
      {/* ── Phone Mockup (1px outline only, 19.5:9) ────────────────── */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-ink-inverse/30"
        style={{
          height: mockupHeight,
          aspectRatio: project.aspectRatio ?? '390/844',
          filter: `brightness(${brightness})`,
          transition: 'filter 500ms ease-out',
        }}
        data-mockup
      >
        {/* Video — autoplay muted loop playsinline + poster fallback */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={project.videoPoster}
          aria-label={`${project.title} demo`}
        >
          {project.videoWebmSrc && (
            <source src={project.videoWebmSrc} type="video/webm" />
          )}
          {project.videoSrc && (
            <source src={project.videoSrc} type="video/mp4" />
          )}
        </video>
      </div>

      {/* ── 메타 영역 ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center text-center"
        style={{ maxWidth: isFeatured ? '420px' : '280px' }}
      >
        {/* date · category mono */}
        <div
          className="mb-3 flex items-center gap-2 font-mono uppercase tracking-[0.18em] text-ink-inverse/55"
          style={{ fontSize: isFeatured ? '12px' : '11px' }}
          data-meta
        >
          <span>{project.date}</span>
          <span className="text-ink-inverse/25">·</span>
          <span>{project.category}</span>
          {project.workType && (
            <>
              <span className="text-ink-inverse/25">·</span>
              <span className={isFeatured ? 'text-ink-inverse/80' : 'text-ink-inverse/40'}>
                {project.workType === 'original' ? 'Original' : 'Redesign'}
              </span>
            </>
          )}
        </div>

        {/* title — PP Editorial serif */}
        <h3
          className="font-display tracking-tight leading-[0.95] text-ink-inverse"
          style={{
            fontSize: isFeatured ? 'clamp(36px, 4vw, 56px)' : 'clamp(24px, 2.4vw, 36px)',
            fontWeight: 400,
            willChange: 'transform, opacity',
          }}
          data-title
        >
          {project.title}
        </h3>

        {/* subline — featured 만 */}
        {showSubline && (
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-inverse/60 tracking-tight">
            {project.subline}
          </p>
        )}

        {/* 진입 옵션 — featured 만 (View Site + View Case) */}
        {isFeatured && (
          <div className="mt-6 flex flex-col items-center gap-4">
            {project.siteHref ? (
              <a
                href={project.siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group/site inline-flex items-center gap-3"
              >
                <span className="h-px w-5 bg-ink-inverse/60 transition-[width,background-color] duration-500 ease-out group-hover/site:w-10 group-hover/site:bg-ink-inverse" />
                <span className="font-mono text-[15px] uppercase tracking-[0.18em] text-ink-inverse/80 group-hover/site:text-ink-inverse transition-colors duration-300">
                  View Site
                </span>
                <span className="font-mono text-[15px] text-ink-inverse/60 group-hover/site:text-ink-inverse transition-[transform,color] duration-300 group-hover/site:translate-x-1">
                  →
                </span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-3">
                <span className="h-px w-5 bg-ink-inverse/25" />
                <span className="font-mono text-[15px] uppercase tracking-[0.18em] text-ink-inverse/35">
                  View Site
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-inverse/25">
                  — SOON
                </span>
              </span>
            )}
            {showCaseEntry && (
              <a
                href={project.studyHref}
                className="group/case inline-flex items-center gap-3"
              >
                <span className="h-px w-5 bg-ink-inverse/60 transition-[width,background-color] duration-500 ease-out group-hover/case:w-10 group-hover/case:bg-ink-inverse" />
                <span className="font-mono text-[15px] uppercase tracking-[0.18em] text-ink-inverse/80 group-hover/case:text-ink-inverse transition-colors duration-300">
                  View Case
                </span>
                <span className="font-mono text-[15px] text-ink-inverse/60 group-hover/case:text-ink-inverse transition-[transform,color] duration-300 group-hover/case:translate-x-1">
                  →
                </span>
              </a>
            )}
          </div>
        )}

        {/* archive — View Site 만 작게 */}
        {!isFeatured && (
          <div className="mt-4">
            {project.siteHref ? (
              <a
                href={project.siteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group/asite inline-flex items-center gap-2"
              >
                <span className="h-px w-4 bg-ink-inverse/40 transition-[width] duration-500 ease-out group-hover/asite:w-8" />
                <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-inverse/60 group-hover/asite:text-ink-inverse transition-colors duration-300">
                  View Site →
                </span>
              </a>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-inverse/30">
                Site soon
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

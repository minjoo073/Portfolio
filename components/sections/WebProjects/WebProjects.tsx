'use client'

import { useRef } from 'react'
import { projects } from '@/data/projects'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { ArchiveCard } from './ProjectCard'
import { HeroStickyExchange } from './HeroStickyExchange'
import { registerGsap } from '@/lib/gsap/config'
import { EASE } from '@/lib/gsap/tokens'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Web Projects — Set 3 · Sticky Visual Exchange (2026-06-19).
 *
 * 구조:
 *   Hero  (01–05): HeroStickyExchange — 단일 sticky 섹션, 비주얼 고정 + 본문 슬라이드
 *   Archive (06+07): 단일 ~60vh 섹션, 좌50/우50 분할
 *
 * 모션:
 *   Hero  — CSS sticky + ScrollTrigger scrub (Lenis pin 충돌 없음)
 *   Archive  — 두 카드 stagger fade-up
 */
export function WebProjects() {
  const rootRef = useRef<HTMLElement>(null)

  useGsapContext(
    () => {
      registerGsap()

      const root = rootRef.current
      if (!root) return

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isReduced) return

      // Archive 처리 완전 제거 — ArchiveCard 의 React 렌더에 의존 (default visible)
      // Lenis 안전 refresh
      gsap.delayedCall(0.3, () => ScrollTrigger.refresh())
    },
    rootRef,
    []
  )

  /* 01–05 hero, 06–07 archive 분리 */
  const heroProjects = projects.filter(p => p.displayType === 'featured')
  const archiveProjects = projects.filter(p => p.displayType === 'archive')
  const totalCount = projects.length

  return (
    <section
      ref={rootRef}
      id="work"
      className="relative w-full bg-dark text-ink-inverse"
      data-section="web-projects"
    >
      {/* ── Hero 카드 01–05 — Sticky Visual Exchange ──────────────── */}
      <HeroStickyExchange projects={heroProjects} total={totalCount} />

      {/* ── Archive 섹션 06+07 — 한 화면 가득 (사용자가 보고 지나가게) ───── */}
      {archiveProjects.length > 0 && (
        <div
          className="relative w-full"
          style={{ minHeight: '100vh', paddingTop: '15vh', paddingBottom: '6vh', position: 'relative', zIndex: 5 }}
          data-archive-section
        >
          {/* 상단 레이블 */}
          <div
            className="flex items-center gap-4 mb-[6vh]"
            style={{
              paddingLeft: 'clamp(64px, 6.25vw, 120px)',
              paddingRight: 'clamp(64px, 6.25vw, 120px)',
            }}
          >
            <span
              className="font-mono text-ink-inverse/25"
              style={{ fontSize: '12px', letterSpacing: '0.16em' }}
            >
              ARCHIVE
            </span>
            <div className="flex-1 h-px bg-ink-inverse/10" aria-hidden />
          </div>

          {/* 좌50 / 우50 그리드 — hairline 없음 */}
          <div
            className="grid grid-cols-2"
            style={{
              paddingLeft: 'clamp(64px, 6.25vw, 120px)',
              paddingRight: 'clamp(64px, 6.25vw, 120px)',
              gap: `0 clamp(48px, 4.17vw, 80px)`,
            }}
          >
            {archiveProjects.map((project) => (
              <ArchiveCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* ── 전환 여백 (Archive → MobileIntro 사이) ─── */}
      <div className="h-[6vh]" aria-hidden />
    </section>
  )
}

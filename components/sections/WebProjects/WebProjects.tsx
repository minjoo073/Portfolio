'use client'

import { useRef } from 'react'
import { projects } from '@/data/projects'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
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
  const isMobile = useIsMobile()

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
              paddingLeft: 'clamp(24px, 6.25vw, 120px)',
              paddingRight: 'clamp(24px, 6.25vw, 120px)',
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

          {/* 모바일: 손가락 가로 스와이프(scroll-snap 캐러셀) / md+: 좌50·우50 그리드.
              data-lenis-prevent 는 *모바일에서만* — 데스크탑(grid)에 붙으면 Lenis 가
              이 영역 위 세로 휠을 무시해 06/07 하단 스크롤이 버벅임. */}
          <div
            data-lenis-prevent={isMobile ? '' : undefined}
            className="flex snap-x snap-mandatory overflow-x-auto md:grid md:grid-cols-2 md:overflow-x-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              paddingLeft: 'clamp(24px, 6.25vw, 120px)',
              paddingRight: 'clamp(24px, 6.25vw, 120px)',
              // 모바일 간격 축소 → 07 카드가 우측에 살짝 보여 스와이프 어포던스 확보
              columnGap: 'clamp(16px, 4.17vw, 80px)',
              scrollPaddingLeft: 'clamp(24px, 6.25vw, 120px)',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
            }}
          >
            {archiveProjects.map((project) => (
              <div
                key={project.id}
                className="shrink-0 w-[80vw] snap-center md:w-auto"
              >
                <ArchiveCard project={project} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 전환 여백 (Archive → MobileIntro 사이) ─── */}
      <div className="h-[6vh]" aria-hidden />
    </section>
  )
}

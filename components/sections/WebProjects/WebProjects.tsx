'use client'

import { useRef } from 'react'
import { projects } from '@/data/projects'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { ArchiveCard } from './ProjectCard'
import { HeroStickyExchange } from './HeroStickyExchange'
import { registerGsap } from '@/lib/gsap/config'
import { EASE } from '@/lib/gsap/tokens'
import gsap from 'gsap'

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

      // ── Archive 카드 등장 ──────────────────────────────────────────
      const archiveCards = root.querySelectorAll('[data-archive-card]')

      archiveCards.forEach((card, i) => {
        const visualEl   = card.querySelector('[data-visual]')
        const titleEl    = card.querySelector('[data-title]')
        const metaEls    = Array.from(card.querySelectorAll('[data-meta]'))

        // 카드 자체 fade-up
        gsap.from(card, {
          opacity: 0,
          y: 16,
          duration: 1.0,
          ease: EASE.enter,
          delay: i * 0.12,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })

        // 이미지 reveal — opacity 0→1
        if (visualEl) {
          gsap.from(visualEl, {
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out',
            delay: i * 0.12,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }

        // 타이틀 reveal — x -16→0 + opacity 0→1
        if (titleEl) {
          gsap.from(titleEl, {
            x: -16,
            opacity: 0,
            duration: 1.0,
            ease: 'sine.out',
            delay: i * 0.12 + 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }

        // 메타/CTA stagger fade-up
        if (metaEls.length > 0) {
          gsap.from(metaEls, {
            y: 8,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: 'power2.out',
            delay: i * 0.12 + 0.2,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }
      })

      // Lenis 안전 refresh
      gsap.delayedCall(0.1, () => {
        const ST = (gsap as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
        if (ST?.refresh) ST.refresh()
      })
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

      {/* ── Archive 섹션 06+07 — 단일 ~60vh 블록 ────────────────── */}
      {archiveProjects.length > 0 && (
        <div
          className="relative w-full"
          style={{ minHeight: '60vh', paddingTop: '10vh', paddingBottom: '10vh' }}
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

      {/* ── 전환 여백 ────────────────────────────────────────────── */}
      <div className="h-[20vh]" aria-hidden />
    </section>
  )
}

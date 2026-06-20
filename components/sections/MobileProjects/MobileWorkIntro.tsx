'use client'

/**
 * MobileWorkIntro — Web Projects ↔ Mobile Projects 섹션 전환(챕터 슬레이트).
 *
 * WorkIntro 의 모션 패턴 완전 동일 복제. 텍스트만 변경:
 *   "Two apps, / one designer, / one keyboard."
 *
 * 구조: 260vh 섹션 + sticky 100vh 패널 (CSS sticky, Lenis 안전).
 *
 *   0.00–0.45  REVEAL : 거대 serif 타이포 clip-wipe(위→아래) + hairline L→R + 메타 fade
 *   0.45–0.55  HOLD   : 정지(읽힘)
 *   0.55–1.00  EXIT   : 검정 커튼 강하(linear) + 패널 fade(power1.out) → 자린고비 인계
 *
 * 헌법: CSS/GSAP/clip-path. reduced-motion → 정적 표시 폴백.
 */

import { useRef } from 'react'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap, gsap } from '@/lib/gsap/config'

export function MobileWorkIntro() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGsapContext(
    () => {
      registerGsap()
      const root = rootRef.current
      if (!root) return

      const head    = root.querySelector('[data-mwi-head]')
      const line    = root.querySelector('[data-mwi-line]')
      const meta    = root.querySelector('[data-mwi-meta]')
      const panel   = root.querySelector('[data-mwi-panel]')
      const curtain = root.querySelector('[data-mwi-curtain]')
      if (!head || !line || !meta || !panel || !curtain) return

      // 커튼 초기 상태 — reduced-motion 가드 바깥에서 항상 화면 위에 숨김
      gsap.set(curtain, { yPercent: -100, willChange: 'transform' })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // 초기(가림) 상태
      gsap.set(head, { clipPath: 'inset(0% 0% 100% 0%)', y: 14 })
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(meta, { opacity: 0, y: 12 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })

      // REVEAL — 거대 serif 타이포가 위→아래로 드러남 (WorkIntro 와 동일 clip 언어)
      tl.to(head, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power2.out', duration: 0.4 }, 0)
      tl.to(line, { scaleX: 1, ease: 'power2.out', duration: 0.44 }, 0.08)
      tl.to(meta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.22)
      // HOLD 0.45–0.55 (gap)
      // EXIT — Drop Curtain: 검정 슬래브 강하 + 패널 fade
      tl.to(curtain, { yPercent: 0, ease: 'none', duration: 0.45 }, 0.55)
      tl.to(panel,   { yPercent: 8, opacity: 0, ease: 'power1.out', duration: 0.40 }, 0.61)
    },
    rootRef,
    []
  )

  return (
    <section
      ref={rootRef}
      aria-label="Mobile Projects"
      className="relative text-ink-inverse"
      style={{ height: '260vh', background: '#0A0A0A' }}
      data-section="mobile-work-intro"
    >
      <div
        data-mwi-panel
        className="sticky top-0 flex h-screen flex-col justify-center px-side-m md:px-side-t xl:px-side-d"
      >
        {/* Drop Curtain — 화면 위 대기, EXIT 구간에 강하해 패널 전체 덮음 */}
        <div
          data-mwi-curtain
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: '#0A0A0A' }}
          aria-hidden
        />

        {/* 거대 serif 매거진 manifesto */}
        <h2
          data-mwi-head
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 'clamp(48px, 11vw, 196px)',
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
            color: 'rgba(248,247,244,1.00)',
            margin: 0,
          }}
        >
          Mobile
          <br />
          Work
        </h2>

        {/* hairline */}
        <div
          data-mwi-line
          style={{
            marginTop: '5vh',
            height: '1px',
            width: '100%',
            background: 'rgba(248,247,244,0.25)',
          }}
          aria-hidden
        />

        {/* 매거진 톤 메타 — 좌측 정렬 */}
        <div
          data-mwi-meta
          style={{
            marginTop: '3vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            className="font-kr text-ink-muted tracking-[0.04em]"
            style={{ fontSize: '18px' }}
          >
            Mobile &nbsp;/&nbsp; Two &mdash;&nbsp; 자린고비&nbsp;+&nbsp;TripMate
          </span>
        </div>
      </div>
    </section>
  )
}

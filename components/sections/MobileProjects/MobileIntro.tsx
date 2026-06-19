'use client'

/**
 * MobileIntro — Web Projects ↔ Mobile Projects 섹션 전환(챕터 슬레이트).
 * WorkIntro 와 동일 패턴 — 거대 타이포 슬레이트 + Drop Curtain.
 *
 *   0.00–0.45  REVEAL : 거대 'MOBILE / WORK' clip-wipe(위→아래) + 하단선 L→R + 메타 fade
 *   0.45–0.55  HOLD   : 정지(읽힘)
 *   0.55–1.00  EXIT   : 검정 커튼 강하 + 패널 fade → 모바일 카드 01 로 인계
 */

import { useRef } from 'react'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap, gsap } from '@/lib/gsap/config'

export function MobileIntro() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGsapContext(
    () => {
      registerGsap()
      const root = rootRef.current
      if (!root) return

      const head = root.querySelector('[data-mi-head]')
      const line = root.querySelector('[data-mi-line]')
      const meta = root.querySelector('[data-mi-meta]')
      const panel = root.querySelector('[data-mi-panel]')
      const curtain = root.querySelector('[data-mi-curtain]')
      if (!head || !line || !meta || !panel || !curtain) return

      gsap.set(curtain, { yPercent: -100, willChange: 'transform' })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

      tl.to(head, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power2.out', duration: 0.4 }, 0)
      tl.to(line, { scaleX: 1, ease: 'power2.out', duration: 0.44 }, 0.08)
      tl.to(meta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.22)
      tl.to(curtain, { yPercent: 0, ease: 'none', duration: 0.45 }, 0.55)
      tl.to(panel, { yPercent: 8, opacity: 0, ease: 'power1.out', duration: 0.40 }, 0.61)
    },
    rootRef,
    []
  )

  return (
    <section
      ref={rootRef}
      aria-label="Mobile Work"
      className="relative bg-dark text-ink-inverse"
      style={{ height: '260vh' }}
      data-section="mobile-intro"
    >
      <div
        data-mi-panel
        className="sticky top-0 flex h-screen flex-col justify-center px-side-m md:px-side-t xl:px-side-d"
      >
        <div
          data-mi-curtain
          className="absolute inset-0 bg-dark z-10 pointer-events-none"
          aria-hidden
        />

        <h2
          data-mi-head
          className="font-sans font-semibold uppercase text-ink-inverse"
          style={{
            fontSize: 'clamp(48px, 11vw, 196px)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
          }}
        >
          Mobile
          <br />
          Work
        </h2>

        <div data-mi-line className="mt-[5vh] h-px w-full bg-ink-inverse/25" aria-hidden />

        <p
          data-mi-meta
          className="text-ink-muted mt-[3vh] font-kr tracking-[0.04em]"
          style={{ fontSize: '18px' }}
        >
          UX &nbsp;·&nbsp; UI &nbsp;·&nbsp; 인터랙션 &nbsp;·&nbsp; 2026
        </p>
      </div>
    </section>
  )
}

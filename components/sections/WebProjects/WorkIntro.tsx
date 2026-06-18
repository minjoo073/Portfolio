'use client'

/**
 * WorkIntro — About ↔ Web Projects 섹션 전환(챕터 슬레이트).
 * CEO 선택 2026-06-18: "거대 타이포 슬레이트".
 *
 * 구조: 200vh 섹션 안에 sticky 100vh 패널 → 스크롤 동안 화면에 고정(핀 대신 CSS sticky,
 * Lenis 와 충돌 없음). 스크럽 타임라인이 진행률을 reveal→hold→exit 로 매핑.
 *
 *   0.00–0.52  REVEAL : 거대 'SELECTED WORK' clip-wipe(위→아래) + 하단선 L→R + 메타 fade
 *   0.52–0.62  HOLD   : 정지(읽힘)
 *   0.62–1.00  EXIT   : 패널 scale↓·y↑·fade → 카드 01 로 인계
 *
 * 헌법: CSS/GSAP/clip-path(필터 아님). reduced-motion → effect skip(정적 표시 폴백).
 * 위 About 인덱스의 mask-wipe / 종이 모티프와 같은 clip 언어 재사용 → 결 통일.
 */

import { useRef } from 'react'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap, gsap } from '@/lib/gsap/config'

export function WorkIntro() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGsapContext(
    () => {
      registerGsap()
      const root = rootRef.current
      if (!root) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const head = root.querySelector('[data-wi-head]')
      const line = root.querySelector('[data-wi-line]')
      const meta = root.querySelector('[data-wi-meta]')
      const panel = root.querySelector('[data-wi-panel]')
      if (!head || !line || !meta || !panel) return

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

      // REVEAL — 거대 타이포가 위→아래로 드러남(About 인덱스와 같은 clip 언어)
      tl.to(head, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power2.out', duration: 0.4 }, 0)
      tl.to(line, { scaleX: 1, ease: 'power2.out', duration: 0.44 }, 0.08)
      tl.to(meta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.22)
      // HOLD 0.52–0.62 (gap)
      // EXIT — 슬레이트가 빠지며 카드로 인계
      tl.to(
        panel,
        { scale: 0.92, opacity: 0, y: -36, ease: 'power2.in', duration: 0.38 },
        0.62
      )
    },
    rootRef,
    []
  )

  return (
    <section
      ref={rootRef}
      aria-label="Selected Work"
      className="relative bg-dark text-ink-inverse"
      style={{ height: '200vh' }}
      data-section="work-intro"
    >
      <div
        data-wi-panel
        className="sticky top-0 flex h-screen flex-col justify-center px-side-m md:px-side-t xl:px-side-d"
      >
        <h2
          data-wi-head
          className="font-sans font-semibold uppercase text-ink-inverse"
          style={{
            fontSize: 'clamp(48px, 11vw, 196px)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
          }}
        >
          Web
          <br />
          Work
        </h2>

        <div data-wi-line className="mt-[5vh] h-px w-full bg-ink-inverse/25" aria-hidden />

        <p
          data-wi-meta
          className="text-ink-muted mt-[3vh] font-kr tracking-[0.04em]"
          style={{ fontSize: '18px' }}
        >
          기획 &nbsp;·&nbsp; 디자인 &nbsp;·&nbsp; 퍼블리싱 &nbsp;·&nbsp; 2026
        </p>
      </div>
    </section>
  )
}

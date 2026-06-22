'use client'

/**
 * WorkIntro — About ↔ Web Projects 섹션 전환(챕터 슬레이트).
 * CEO 선택 2026-06-18: "거대 타이포 슬레이트".
 *
 * 구조: 260vh 섹션 안에 sticky 100vh 패널 → 스크롤 동안 화면에 고정(핀 대신 CSS sticky,
 * Lenis 와 충돌 없음). 스크럽 타임라인이 진행률을 reveal→hold→exit 로 매핑.
 *
 *   0.00–0.45  REVEAL : 거대 'SELECTED WORK' clip-wipe(위→아래) + 하단선 L→R + 메타 fade
 *   0.45–0.55  HOLD   : 정지(읽힘)
 *   0.55–1.00  EXIT   : 검정 커튼 강하(linear) + 패널 fade(power1.out) → 카드 01 로 인계
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

      const head = root.querySelector('[data-wi-head]')
      const line = root.querySelector('[data-wi-line]')
      const meta = root.querySelector('[data-wi-meta]')
      const panel = root.querySelector('[data-wi-panel]')
      const curtain = root.querySelector('[data-wi-curtain]')
      if (!head || !line || !meta || !panel || !curtain) return

      // 커튼 초기 상태 — reduced-motion 가드 바깥에서 설정해 항상 화면 위에 숨김
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

      // REVEAL — 거대 타이포가 위→아래로 드러남(About 인덱스와 같은 clip 언어)
      tl.to(head, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power2.out', duration: 0.4 }, 0)
      tl.to(line, { scaleX: 1, ease: 'power2.out', duration: 0.44 }, 0.08)
      tl.to(meta, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.22)
      // HOLD 0.45–0.55 (gap)
      // EXIT — Drop Curtain: 검정 슬래브 강하로 패널 전체 덮음 + 패널 fade
      // ease: none → 스크롤 1:1 매핑, 후반 가속 "휙" 제거
      // 구간 0.55–1.00 (45%) + 섹션 260vh → 실제 ~117vh 분량, 천천히 차오르는 느낌
      tl.to(curtain, { yPercent: 0, ease: 'none', duration: 0.45 }, 0.55)
      tl.to(panel, { yPercent: 8, opacity: 0, ease: 'power1.out', duration: 0.40 }, 0.61)
    },
    rootRef,
    []
  )

  return (
    <section
      ref={rootRef}
      aria-label="Selected Work"
      className="relative bg-dark text-ink-inverse"
      style={{ height: '260vh' }}
      data-section="work-intro"
    >
      <div
        data-wi-panel
        className="sticky top-0 flex h-screen flex-col justify-center px-side-m md:px-side-t xl:px-side-d"
      >
        {/* Drop Curtain — 화면 위에 대기, EXIT 구간에 강하해 패널 전체를 덮음 */}
        <div
          data-wi-curtain
          className="absolute inset-0 bg-dark z-10 pointer-events-none"
          aria-hidden
        />

        <h2
          data-wi-head
          className="text-ink-inverse"
          style={{
            fontFamily: 'var(--font-display), var(--font-pretendard), sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(48px, 11vw, 196px)',
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
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

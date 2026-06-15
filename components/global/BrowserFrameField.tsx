'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from './ReducedMotionProvider'
import { useIsMobile, useIsTablet } from '@/lib/hooks/useMediaQuery'

interface BrowserFrameFieldProps {
  count?: number
}

interface FrameLayout {
  width: string // CSS unit ('92vw' 또는 '680px')
  height: string
  top: string
  left: string
  rotate: number // deg
}

/**
 * 단일 거대 frame이 viewport 거의 전체 차지 (Blob 위치/역할 1:1 대체).
 * 사이즈는 vw/vh 비율 — 모든 viewport에서 자동 가득.
 * 미세 잔향 1개는 외곽 (시각 무게 거의 0).
 */
const DESKTOP_LAYOUT: FrameLayout[] = [
  // [0] 거대 메인 — viewport 가로 92%, 세로 84%
  { width: '92vw', height: '84vh', top: '6vh', left: '4vw', rotate: -1 },
  // [1] 잔향 1개 — viewport 우상단 외곽
  { width: '140px', height: '95px', top: '4vh', left: '90vw', rotate: -3 }
]

const TABLET_LAYOUT: FrameLayout[] = [
  { width: '94vw', height: '82vh', top: '7vh', left: '3vw', rotate: -1 },
  { width: '110px', height: '75px', top: '5vh', left: '86vw', rotate: -3 }
]

const MOBILE_LAYOUT: FrameLayout[] = [
  { width: '96vw', height: '76vh', top: '10vh', left: '2vw', rotate: -1 }
]

function pickLayout(isMobile: boolean, isTablet: boolean, count: number): FrameLayout[] {
  if (isMobile) return MOBILE_LAYOUT.slice(0, Math.min(count, MOBILE_LAYOUT.length))
  if (isTablet) return TABLET_LAYOUT.slice(0, Math.min(count, TABLET_LAYOUT.length))
  return DESKTOP_LAYOUT.slice(0, Math.min(count, DESKTOP_LAYOUT.length))
}

/**
 * 전역 Browser Frame Field — 3차 §2.2 재설계.
 *
 * 핵심:
 *   ✓ Frame이 공간의 주인공 (배경 장식 ❌)
 *   ✓ 2~3배 확대된 사이즈 (600~1280px)
 *   ✓ 일부 viewport 밖으로 의도된 cropping
 *   ✓ 명시된 외곽선 + 상단 chrome bar + dot 3개
 *   ✓ 라운드 코너 12~16px
 *   ✓ body 영역에만 backdrop-filter + SVG displacement — 겹치는 영역만 굴절
 *   ✓ 각자 다른 위상의 부유 모션 (절대 동기화 안 됨)
 */
export function BrowserFrameField({ count = 5 }: BrowserFrameFieldProps) {
  const reduced = useReducedMotionContext()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<Array<HTMLDivElement | null>>([])

  const layout = pickLayout(isMobile, isTablet, count)

  // backdrop blur — 매우 미세 (큰 타이포에서만 굴절 인지, 작은 텍스트는 영향 없음)
  const blurAmount = isMobile ? 1.5 : isTablet ? 1.8 : 2
  // body opacity — frame이 거의 투명한 유리
  const bodyOpacity = 0.22

  useEffect(() => {
    registerGsap()
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      frameRefs.current.forEach((el, i) => {
        if (!el) return
        const c = layout[i]
        if (!c) return

        // 부유 모션 — 사이즈가 커진 만큼 범위도 비례 확대
        // 각자 다른 duration → 절대 동기화 안 됨
        if (reduced) return

        // RayRayLab Blob 톤 — 미세하고 느린 부유. frame 작아진 만큼 범위도 축소.
        const phase = i * 0.37 // 각자 다른 시작 위상
        const xRange = 22 + i * 6 // 22~46px
        const yRange = 16 + i * 4 // 16~32px
        const rRange = 1 + (i % 3) * 0.4 // ±1~1.8°
        const durX = 9 + i * 0.7
        const durY = 8 + i * 0.5
        const durR = 11 + i * 0.4

        gsap.to(el, {
          x: `+=${xRange}`,
          duration: durX,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: phase
        })
        gsap.to(el, {
          y: `+=${yRange}`,
          duration: durY,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: phase * 0.7
        })
        gsap.to(el, {
          rotation: `+=${rRange}`,
          duration: durR,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: phase * 1.3
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [reduced, isMobile, isTablet, count])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-frame overflow-hidden"
    >
      {layout.map((c, i) => (
        <div
          key={i}
          ref={el => {
            frameRefs.current[i] = el
          }}
          className="absolute rounded-xl border overflow-hidden"
          style={{
            width: c.width,
            height: c.height,
            top: c.top,
            left: c.left,
            transform: `rotate(${c.rotate}deg)`,
            borderColor: 'rgba(17, 17, 17, 0.16)',
            borderWidth: '1px',
            willChange: 'transform',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.4) inset, 0 24px 60px rgba(0,0,0,0.05)'
          }}
        >
          {/* ── Chrome bar (상단 32px) ───────────────────────────
              PORTFOLIO 위에 갔을 때도 글자가 비치도록 더 투명하게.
              outline·dot은 또렷이 유지. */}
          <div
            className="absolute left-0 right-0 top-0 z-10 flex items-center gap-[6px] border-b px-[14px]"
            style={{
              height: 32,
              backgroundColor: 'rgba(248, 247, 244, 0.4)',
              borderBottomColor: 'rgba(17, 17, 17, 0.08)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)'
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: 'rgba(17, 17, 17, 0.22)'
              }}
            />
            <span
              className="block rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: 'rgba(17, 17, 17, 0.22)'
              }}
            />
            <span
              className="block rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: 'rgba(17, 17, 17, 0.22)'
              }}
            />
          </div>

          {/* ── Body 영역 (chrome 아래) ────────────────────────
              반투명 유리 — opacity 0.5로 underneath PORTFOLIO이 비침.
              backdrop blur는 미세 (4~7px) → 글자가 흐려지지 않고 살짝 휘는 굴절감만. */}
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{
              top: 32,
              opacity: bodyOpacity,
              backdropFilter: `blur(${blurAmount}px) saturate(105%)`,
              WebkitBackdropFilter: `blur(${blurAmount}px) saturate(105%)`,
              filter: 'url(#refraction)'
            }}
          />
        </div>
      ))}
    </div>
  )
}

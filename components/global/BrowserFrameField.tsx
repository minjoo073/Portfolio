'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from './ReducedMotionProvider'
import { useIsMobile, useIsTablet } from '@/lib/hooks/useMediaQuery'

interface BrowserFrameFieldProps {
  count?: number
}

interface FrameLayout {
  width: string
  height: string
  top: string
  left?: string
  right?: string
  rotate: number
}

/* 강디 스펙 2026-06-17: 타이틀 우측 1/3~1/2 만 덮는 크기 */
const DESKTOP_LAYOUT: FrameLayout[] = [
  {
    width:  'clamp(300px, 38vw, 560px)',
    height: 'clamp(200px, 38vh, 440px)',
    top:    '18%',
    right:  '8vw',
    rotate: -1
  },
  {
    width:  'clamp(100px, 12vw, 180px)',
    height: 'clamp(70px, 8vh, 120px)',
    top:    '5%',
    right:  '2vw',
    rotate: -3
  }
]

const TABLET_LAYOUT: FrameLayout[] = [
  {
    width:  'clamp(260px, 40vw, 420px)',
    height: 'clamp(180px, 36vh, 360px)',
    top:    '18%',
    right:  '6vw',
    rotate: -1
  },
  {
    width:  'clamp(90px, 11vw, 150px)',
    height: 'clamp(60px, 8vh, 100px)',
    top:    '5%',
    right:  '2vw',
    rotate: -3
  }
]

const MOBILE_LAYOUT: FrameLayout[] = [
  {
    width:  'clamp(180px, 65vw, 280px)',
    height: 'clamp(130px, 40vh, 200px)',
    top:    '20%',
    right:  '4vw',
    rotate: -1
  }
]

function pickLayout(isMobile: boolean, isTablet: boolean, count: number): FrameLayout[] {
  if (isMobile) return MOBILE_LAYOUT.slice(0, Math.min(count, MOBILE_LAYOUT.length))
  if (isTablet) return TABLET_LAYOUT.slice(0, Math.min(count, TABLET_LAYOUT.length))
  return DESKTOP_LAYOUT.slice(0, Math.min(count, DESKTOP_LAYOUT.length))
}

/**
 * BrowserFrameField — Hero 글라스 프레임.
 *
 * 글라스 토큰(강디 2026-06-17):
 *   --glass-border: rgba(255,255,255,0.32)  프레임 외곽선
 *   --glass-fill:   rgba(255,255,255,0.07)  프레임 배경
 *   --glass-inset:  rgba(255,255,255,0.18)  내부 인셋 하이라이트
 *   --glass-shadow: rgba(0,0,0,0.14)        그림자
 *   --glass-blur:   8px                     backdrop-filter
 *
 * 구조 (2층):
 *   mouseWrapperRefs[i] — absolute 위치 + 마우스 추종 (gsap.quickTo x/y)
 *     └─ frameRefs[i]   — 시각 프레임 + idle float (gsap x/y/rotation sine)
 */
export function BrowserFrameField({ count = 5 }: BrowserFrameFieldProps) {
  const reduced  = useReducedMotionContext()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const containerRef      = useRef<HTMLDivElement>(null)
  const frameRefs         = useRef<Array<HTMLDivElement | null>>([])
  const mouseWrapperRefs  = useRef<Array<HTMLDivElement | null>>([])

  const layout = pickLayout(isMobile, isTablet, count)

  useEffect(() => {
    registerGsap()
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      /* ── idle float — frameRefs (inner) ────────────────────────── */
      if (!reduced) {
        frameRefs.current.forEach((el, i) => {
          if (!el) return
          const c = layout[i]
          if (!c) return

          const phase  = i * 0.37
          const xRange = 22 + i * 6
          const yRange = 16 + i * 4
          const rRange = 1  + (i % 3) * 0.4
          const durX   = 9  + i * 0.7
          const durY   = 8  + i * 0.5
          const durR   = 11 + i * 0.4

          gsap.to(el, { x: `+=${xRange}`, duration: durX, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: phase })
          gsap.to(el, { y: `+=${yRange}`, duration: durY, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: phase * 0.7 })
          gsap.to(el, { rotation: `+=${rRange}`, duration: durR, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: phase * 1.3 })
        })
      }

      /* ── 마우스 추종 — mouseWrapperRefs (outer) ─────────────────── */
      if (!reduced && !isMobile) {
        type QuickFn = (value: number, start?: number) => gsap.core.Tween
        const quickToX: QuickFn[] = []
        const quickToY: QuickFn[] = []

        mouseWrapperRefs.current.forEach((el, i) => {
          if (!el) return
          const dur = i === 0 ? 1.4 : 0.9
          quickToX[i] = gsap.quickTo(el, 'x', { duration: dur,        ease: 'power2.out' })
          quickToY[i] = gsap.quickTo(el, 'y', { duration: dur * 0.7,  ease: 'power2.out' })
        })

        const handlePointer = (e: PointerEvent) => {
          const cx = window.innerWidth  / 2
          const cy = window.innerHeight / 2
          mouseWrapperRefs.current.forEach((_, i) => {
            if (!quickToX[i] || !quickToY[i]) return
            const factor = i === 0 ? 0.06 : 0.1
            quickToX[i]((e.clientX - cx) * factor)
            quickToY[i]((e.clientY - cy) * factor * 0.55)
          })
        }

        window.addEventListener('pointermove', handlePointer, { passive: true })
        return () => { window.removeEventListener('pointermove', handlePointer) }
      }
    }, containerRef)

    return () => ctx.revert()
  }, [reduced, isMobile, isTablet, count]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-hero-frames
      className="pointer-events-none absolute inset-0 z-frame overflow-hidden"
    >
      {layout.map((c, i) => (
        <div
          key={i}
          ref={el => { mouseWrapperRefs.current[i] = el }}
          className="absolute will-change-transform"
          style={{
              top: c.top,
              ...(c.right !== undefined ? { right: c.right } : { left: c.left ?? '0' })
            }}
        >
          <div
            ref={el => { frameRefs.current[i] = el }}
            className="rounded-xl overflow-hidden will-change-transform"
            style={{
              width:     c.width,
              height:    c.height,
              transform: `rotate(${c.rotate}deg)`,
              /* backdrop-filter 완전 제거 — 굴절은 WebGL 렌즈 전담 */
              border:     '1px solid rgba(255,255,255,0.20)',
              background: 'rgba(255,255,255,0.06)',
              boxShadow:  'inset 0 0 0 0.5px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.10)'
            }}
          >
            {/* Chrome bar */}
            <div
              className="absolute left-0 right-0 top-0 z-10 flex items-center gap-[6px] border-b px-[14px]"
              style={{
                height:            32,
                backgroundColor:   'rgba(255,255,255,0.10)',
                borderBottomColor: 'rgba(255,255,255,0.20)'
              }}
            >
              {/* 닷 3개 — opacity ≥ 0.7 (강디 스펙) */}
              <span className="block rounded-full" style={{ width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.72)' }} />
              <span className="block rounded-full" style={{ width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.72)' }} />
              <span className="block rounded-full" style={{ width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.72)' }} />
            </div>

            {/* Body 영역 — backdrop-filter 제거, WebGL 렌즈가 굴절 전담 */}
          </div>
        </div>
      ))}
    </div>
  )
}

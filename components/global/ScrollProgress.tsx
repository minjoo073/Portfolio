'use client'

import { useEffect, useState } from 'react'
import { useLenis } from '@/lib/hooks/useLenis'

/**
 * ScrollProgress — 포폴 전체 진행 인디케이터 (좌측 고정).
 *
 * - 세로 hairline 트랙 + 스크롤% 채움
 * - 섹션 경계마다 틱(dot), 현재 섹션 강조 + 섹션명 라벨
 * - 다크/라이트 교차 배경 대응: mix-blend-difference (흰색만 사용)
 * - 틱 클릭 → 해당 섹션으로 부드럽게 점프 (Lenis)
 * - 박스·글라스 X — hairline·dot·텍스트만 (디자인 규칙 준수)
 */
const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'content', label: 'Content' },
  { id: 'visual', label: 'Visual' },
] as const

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [fracs, setFracs] = useState<number[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const lenis = useLenis()

  useEffect(() => {
    const compute = (scrollY: number, max: number) => {
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0)
      const next: number[] = []
      let active = 0
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) {
          next.push(Number.NaN)
          return
        }
        const top = el.getBoundingClientRect().top + scrollY
        next.push(max > 0 ? Math.min(1, Math.max(0, top / max)) : 0)
        if (scrollY >= top - window.innerHeight * 0.4) active = i
      })
      setFracs(next)
      setActiveIdx(active)
    }
    const fromWindow = () => {
      const doc = document.documentElement
      compute(window.scrollY || doc.scrollTop, doc.scrollHeight - window.innerHeight)
    }

    let raf = 0
    let detach: (() => void) | null = null
    if (lenis) {
      // Lenis 부드러운 스크롤 값으로 매 프레임 구동 (window scroll 누락 방지)
      const onLenis = (e: { scroll: number; limit: number }) => compute(e.scroll, e.limit)
      lenis.on('scroll', onLenis)
      detach = () => lenis.off('scroll', onLenis)
    } else {
      const onScroll = () => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(fromWindow)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      detach = () => window.removeEventListener('scroll', onScroll)
    }
    const onResize = () => fromWindow()
    window.addEventListener('resize', onResize)
    fromWindow() // 초기 1회 + 레이아웃 정착 후 재계산
    const t1 = setTimeout(fromWindow, 600)
    const t2 = setTimeout(fromWindow, 1800)
    return () => {
      detach?.()
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [lenis])

  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { duration: 1.0 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const activeFrac = fracs[activeIdx]
  // Hero(intro=0)에선 숨김 → About(1) 이상부터 표시
  const visible = activeIdx >= 1

  return (
    <nav
      aria-label="섹션 진행"
      className="fixed z-40 hidden md:block"
      style={{
        left: 'clamp(16px, 2vw, 40px)',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '44vh',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
      }}
    >
      <div style={{ position: 'relative', height: '100%', width: '1px', background: 'rgba(255,255,255,0.16)' }}>
        {/* 채움 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: `${progress * 100}%`,
            background: 'rgba(255,255,255,0.5)',
            transition: 'height 120ms linear',
          }}
        />
        {/* 섹션 틱 */}
        {SECTIONS.map((s, i) => {
          const f = fracs[i]
          if (f === undefined || Number.isNaN(f)) return null
          const isActive = i === activeIdx
          return (
            <button
              key={s.id}
              onClick={() => jump(s.id)}
              aria-label={s.label}
              aria-current={isActive ? 'true' : undefined}
              style={{
                position: 'absolute',
                top: `${f * 100}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                pointerEvents: visible ? 'auto' : 'none',
              }}
            >
              <span
                style={{
                  width: isActive ? '7px' : '4px',
                  height: isActive ? '7px' : '4px',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.36)',
                  transition: 'all 220ms ease',
                }}
              />
            </button>
          )
        })}
        {/* 현재 섹션명 */}
        {activeFrac !== undefined && !Number.isNaN(activeFrac) && (
          <span
            style={{
              position: 'absolute',
              top: `${activeFrac * 100}%`,
              left: '16px',
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {SECTIONS[activeIdx].label}
          </span>
        )}
      </div>
    </nav>
  )
}

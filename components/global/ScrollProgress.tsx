'use client'

import { useEffect, useState } from 'react'
import { useLenis } from '@/lib/hooks/useLenis'

/**
 * ScrollProgress — 포폴 진행 인디케이터 (B안: 진행선 + 떠다니는 라벨, 좌측 고정).
 *
 * - 얇은 세로 선(트랙) + 스크롤% 채움
 * - 현재 섹션명 라벨이 진행 위치를 따라 미끄러져 이동
 * - 정적 목록/틱 없음 → 콘텐츠 방해 최소
 * - Hero(intro)에선 숨김 → About 부터 표시
 * - 다크/라이트 교차 대응: mix-blend-difference (흰색만)
 * - 박스·글라스 X (디자인 규칙)
 */
const MONO = 'var(--font-mono), var(--font-pretendard), monospace'

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
  const [activeIdx, setActiveIdx] = useState(0)
  const lenis = useLenis()

  useEffect(() => {
    const compute = (scrollY: number, max: number) => {
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0)
      let active = 0
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id)
        if (!el) return
        const top = el.getBoundingClientRect().top + scrollY
        if (scrollY >= top - window.innerHeight * 0.3) active = i
      })
      setActiveIdx(active)
    }
    const fromWindow = () => {
      const doc = document.documentElement
      compute(window.scrollY || doc.scrollTop, doc.scrollHeight - window.innerHeight)
    }

    let raf = 0
    let detach: (() => void) | null = null
    if (lenis) {
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
    fromWindow()
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

  const visible = activeIdx >= 1

  return (
    <div
      aria-hidden
      className="fixed z-40 hidden md:block"
      style={{
        left: 'clamp(16px, 2vw, 36px)',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '42vh',
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
        {/* 떠다니는 현재 섹션 라벨 */}
        <span
          style={{
            position: 'absolute',
            top: `${progress * 100}%`,
            left: '14px',
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
            fontFamily: MONO,
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            transition: 'top 120ms linear',
          }}
        >
          {SECTIONS[activeIdx]?.label ?? ''}
        </span>
      </div>
    </div>
  )
}

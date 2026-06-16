'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LERP } from '@/lib/gsap/tokens'
import { useReducedMotionContext } from './ReducedMotionProvider'
import { useHasHover } from '@/lib/hooks/useMediaQuery'
import { cn } from '@/lib/utils/cn'

type CursorState = 'default' | 'hover-card' | 'hover-link' | 'copy' | 'view-disabled'

/**
 * Custom Cursor — 3차 §10.1.
 * 5-state machine, lerp 0.15, mix-blend-difference.
 *
 * Phase 1: 기본 lerp + default/hover-link 2 state만 자동 처리.
 * card/copy/view-disabled는 Phase 2+ 에서 각 컴포넌트가 data-cursor attribute로 신호.
 *
 * touch device(hover 없음) 또는 reduced-motion: 컴포넌트 자체를 렌더 안 함.
 */
export function CustomCursor() {
  const hasHover = useHasHover()
  const reduced = useReducedMotionContext()
  const pathname = usePathname()
  const cursorRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CursorState>('default')

  // 좌표 ref
  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    if (!hasHover) return

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const lerpFactor = reduced ? 1 : LERP.cursor

    const tick = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * lerpFactor
      pos.current.y += (mouse.current.y - pos.current.y) * lerpFactor
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)

    // delegated hover detection via data-cursor attribute
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const el = target?.closest<HTMLElement>('[data-cursor]')
      if (el) {
        const next = el.dataset.cursor as CursorState
        if (next) setState(next)
      } else {
        // 표준 링크/버튼은 hover-link
        const link = target?.closest<HTMLElement>('a, button, [role="button"]')
        setState(link ? 'hover-link' : 'default')
      }
    }
    document.addEventListener('mouseover', onOver)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [hasHover, reduced])

  // /work/* 케이스스터디 페이지에서는 iframe 내부 케이스 자체 커서와 충돌하므로 렌더 안 함
  if (!hasHover || pathname?.startsWith('/work')) return null

  const sizes: Record<CursorState, string> = {
    default: 'w-3 h-3',
    'hover-link': 'w-[18px] h-[18px]',
    'hover-card': 'w-12 h-12',
    copy: 'w-12 h-12',
    'view-disabled': 'w-6 h-6 bg-transparent border border-ink-inverse'
  }

  const label: Partial<Record<CursorState, string>> = {
    'hover-card': 'View',
    copy: 'Copy'
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-cursor',
        'rounded-full bg-ink-inverse',
        'mix-blend-difference',
        'flex items-center justify-center',
        'transition-[width,height,background-color] duration-300 ease-out',
        sizes[state]
      )}
      style={{ willChange: 'transform' }}
    >
      {label[state] && (
        <span className="text-[10px] font-medium tracking-[0.06em] text-ink-primary">
          {label[state]}
        </span>
      )}
    </div>
  )
}

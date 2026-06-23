'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { navUtilityCenter, navLinks } from '@/data/nav'
import { useLenis } from '@/lib/hooks/useLenis'
import { cn } from '@/lib/utils/cn'

/**
 * 상단 utility bar — 3분할 grid.
 *   좌: utility 라벨 (모노폰트 작은 텍스트)
 *   중: 브랜드/라벨 (비울 수 있음)
 *   우: WORK · CONTACT
 *
 * 배경 적응: mix-blend-difference 는 작은 텍스트 안티앨리어싱을 망가뜨려(레이어 합성 →
 * 그레이스케일 AA + 차연산 fringe) "깨져 보임". 대신 네비 뒤 배경 밝기를 샘플링해
 * 글자색만 전환(밝은 배경 → 어두운 글자 / 어두운 배경 → 밝은 글자) → 선명함 유지.
 */
function luminance(bg: string): number {
  const m = bg.match(/rgba?\(([^)]+)\)/)
  if (!m) return 0
  const parts = m[1].split(',').map((v) => parseFloat(v))
  const [r, g, b] = parts
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function Navigation() {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const lenis = useLenis()
  const [onLight, setOnLight] = useState(true) // 배경이 밝음 → 어두운 글자

  const isWork = pathname.startsWith('/work')

  useEffect(() => {
    if (isWork) return
    const navEl = ref.current
    if (!navEl) return

    const sample = () => {
      const rect = navEl.getBoundingClientRect()
      const x = Math.max(8, rect.left + 24)
      const y = rect.top + rect.height / 2
      const els = document.elementsFromPoint(x, y)
      const behind = els.find((el) => !navEl.contains(el))
      let node: Element | null = behind ?? null
      let bg = ''
      while (node) {
        const c = getComputedStyle(node).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
          bg = c
          break
        }
        node = node.parentElement
      }
      if (!bg) return
      setOnLight(luminance(bg) > 0.5)
    }

    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(sample)
    }

    let detach: (() => void) | null = null
    if (lenis) {
      lenis.on('scroll', schedule)
      detach = () => lenis.off('scroll', schedule)
    } else {
      window.addEventListener('scroll', schedule, { passive: true })
      detach = () => window.removeEventListener('scroll', schedule)
    }
    window.addEventListener('resize', schedule)
    sample()
    // Lenis transform 모드 등 이벤트 누락 대비 가벼운 폴백
    const t1 = setTimeout(sample, 400)
    const t2 = setTimeout(sample, 1200)

    return () => {
      detach?.()
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [lenis, isWork])

  // /work/* 경로에서는 케이스스터디 뷰어 자체 헤더를 쓰므로 숨김
  if (isWork) return null

  return (
    <nav
      ref={ref}
      className={cn(
        'fixed top-0 left-0 right-0 z-nav',
        // 모바일: flex(메뉴 폭 콘텐츠 기준 → 잘림 방지) / md+: 기존 3등분 grid
        'flex justify-between md:grid md:grid-cols-3 items-center',
        'px-side-m py-5 md:px-side-t md:py-6 xl:px-side-d xl:py-7',
        'transition-colors duration-300',
        onLight ? 'text-ink-primary' : 'text-ink-inverse'
      )}
      aria-label="Primary"
    >
      {/* 좌측 — brand 라벨 (이전 navUtilityLeft © copyright 폐기) */}
      <div className="justify-self-start">
        {navUtilityCenter ? (
          <span className="font-mono text-label uppercase tracking-[0.08em]">
            {navUtilityCenter}
          </span>
        ) : null}
      </div>

      {/* 중앙 — 비움 */}
      <div className="justify-self-center" />

      {/* 우측 메뉴 */}
      <ul className="flex items-center gap-6 justify-self-end md:gap-8">
        {navLinks.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                'font-mono text-label uppercase tracking-[0.08em]',
                'relative inline-block',
                'after:absolute after:bottom-[-4px] after:left-0',
                'after:h-[1px] after:w-0 after:bg-current',
                'after:transition-all after:duration-300 after:ease-out',
                'hover:after:w-full'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

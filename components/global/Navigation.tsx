'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { navUtilityCenter, navLinks } from '@/data/nav'
import { useLenis } from '@/lib/hooks/useLenis'
import { cn } from '@/lib/utils/cn'
import { FreelanceModal } from '@/components/global/FreelanceModal'

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
  const [clientOpen, setClientOpen] = useState(false) // 외주(CLIENT) 오버레이
  // Hero(#intro) 위에선 네비 숨김, About 진입 시 페이드인. 초기값 true(페이지 진입=Hero).
  const [hidden, setHidden] = useState(true)

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

    // Hero(#intro) 가 네비 라인을 덮고 있으면 숨김 → About 진입(Hero 하단이 상단 통과) 시 노출.
    const updateHidden = () => {
      const intro = document.getElementById('intro')
      if (!intro) { setHidden(false); return } // Hero 없는 페이지: 항상 노출
      setHidden(intro.getBoundingClientRect().bottom > 64)
    }

    // 짧은 주기 폴링으로 직접 샘플 — lenis scroll 이벤트 의존(정착 지연 ~2.5s)을 제거.
    // 다크↔라이트 섹션 전환 시 글자색이 120ms 내 즉시 따라감(다크-온-다크 안 보임 방지).
    // elementsFromPoint 1회 + 부모 몇 단계 = 매우 저렴, 8회/초.
    const tick = () => { sample(); updateHidden() }
    const raf = { id: 0 }
    const schedule = () => {
      cancelAnimationFrame(raf.id)
      raf.id = requestAnimationFrame(tick)
    }
    tick()
    const interval = window.setInterval(tick, 120)
    window.addEventListener('resize', schedule)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(raf.id)
    }
  }, [isWork])

  // /work/* 경로에서는 케이스스터디 뷰어 자체 헤더를 쓰므로 숨김
  if (isWork) return null

  return (
    <>
    <nav
      ref={ref}
      className={cn(
        'fixed top-0 left-0 right-0 z-nav',
        // 모바일: flex(메뉴 폭 콘텐츠 기준 → 잘림 방지) / md+: 기존 3등분 grid
        'flex justify-between md:grid md:grid-cols-3 items-center',
        'px-side-m py-5 md:px-side-t md:py-6 xl:px-side-d xl:py-7',
        // Hero 위에선 숨김(opacity 0 + 클릭 불가), About 진입 시 페이드인
        'transition-[opacity,color] duration-500',
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100',
        onLight ? 'text-ink-primary' : 'text-ink-inverse'
      )}
      aria-hidden={hidden}
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
        {navLinks.map(link => {
          const linkClass = cn(
            'font-mono text-label uppercase tracking-[0.08em]',
            'relative inline-block',
            'after:absolute after:bottom-[-4px] after:left-0',
            'after:h-[1px] after:w-0 after:bg-current',
            'after:transition-all after:duration-300 after:ease-out',
            'hover:after:w-full'
          )
          return (
            <li key={link.href}>
              {link.modal ? (
                <button
                  type="button"
                  onClick={() => setClientOpen(true)}
                  className={cn(linkClass, 'cursor-pointer')}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  href={link.href}
                  onClick={(e) => {
                    // 섹션 top 으로 정확히 정렬 → sticky/horizontal 섹션이 항상 첫 작품부터 보임.
                    // 네이티브 해시 점프는 위치가 어긋날 수 있어 lenis 로 top 정렬.
                    if (!link.href.startsWith('#')) return
                    const target = document.querySelector(link.href)
                    if (!target) return
                    e.preventDefault()
                    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: 0 })
                    else (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={linkClass}
                >
                  {link.label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
    <FreelanceModal open={clientOpen} onClose={() => setClientOpen(false)} />
    </>
  )
}

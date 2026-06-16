'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { navUtilityLeft, navUtilityCenter, navLinks } from '@/data/nav'
import { cn } from '@/lib/utils/cn'

/**
 * 상단 utility bar — 3분할 grid.
 *   좌: utility 라벨 (모노폰트 작은 텍스트)
 *   중: 브랜드/라벨 (비울 수 있음)
 *   우: WORK · CONTACT
 */
export function Navigation() {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // /work/* 경로에서는 케이스스터디 뷰어 자체 헤더를 쓰므로 숨김
  if (pathname.startsWith('/work')) return null

  return (
    <nav
      ref={ref}
      className={cn(
        'fixed top-0 left-0 right-0 z-nav',
        'grid grid-cols-3 items-center',
        'px-side-m py-5 md:px-side-t md:py-6 xl:px-side-d xl:py-7',
        'mix-blend-difference text-ink-inverse'
      )}
      aria-label="Primary"
    >
      {/* 좌측 utility */}
      <div className="justify-self-start">
        <span className="font-mono text-label uppercase tracking-[0.08em]">
          {navUtilityLeft}
        </span>
      </div>

      {/* 중앙 라벨 (비어있을 수 있음) */}
      <div className="justify-self-center">
        {navUtilityCenter ? (
          <span className="font-mono text-label uppercase tracking-[0.08em]">
            {navUtilityCenter}
          </span>
        ) : null}
      </div>

      {/* 우측 메뉴 */}
      <ul className="flex items-center gap-6 justify-self-end md:gap-8">
        {navLinks.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                'font-display text-label uppercase tracking-[0.08em] font-medium',
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

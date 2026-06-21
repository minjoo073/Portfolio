'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { footer } from '@/data/footer'

/**
 * Footer — *판권 페이지 (colophon)* 톤.
 *
 *   [20vh 다크 spacer]
 *     · hairline 중앙 → 좌우 sweep (페이지 "닫힘" 신호)
 *     · status whisper 정중앙 — "Available for design opportunities"
 *
 *   [한 줄 footer ~12vh, 다크 그대로]
 *     좌: Park Minjoo · Seoul       (정체성)
 *     중: Mail · Notion · GitHub    (보조 채널, 작게)
 *     우: Resume PDF ↗              (유일한 강조)
 *
 *   [bottom micro]
 *     © 2026 · Designed and built solo
 */
export function Footer() {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const sweep = container.querySelector('[data-footer-sweep]')
      const status = container.querySelector('[data-footer-status]')
      const left = container.querySelector('[data-footer-left]')
      const middle = container.querySelector('[data-footer-middle]')
      const right = container.querySelector('[data-footer-right]')
      const bottom = container.querySelector('[data-footer-bottom]')

      // *모든 텍스트는 정적 visible 보장* — ScrollTrigger 가 fire 안 되더라도 텍스트는 항상 보임
      // 모션은 gsap.from() 으로 *진입 시 fade-in 추가 효과*만 (초기 상태 강제 X)

      // hairline sweep — scrub
      if (sweep) {
        gsap.set(sweep, { scaleX: 0, transformOrigin: 'center center' })
        ScrollTrigger.create({
          trigger: container,
          start: 'top 90%',
          end: 'top 50%',
          scrub: 1.5,
          invalidateOnRefresh: true,
          animation: gsap.to(sweep, { scaleX: 1, ease: 'power2.out' }),
        })
      }

      // status whisper — 진입 시 살짝 fade
      if (status) {
        ScrollTrigger.create({
          trigger: container,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.from(status, { opacity: 0, y: 8, duration: 0.6, ease: 'power2.out' })
          },
        })
      }

      // 좌→중→우 stagger — gsap.from() = 초기 상태 visible, 진입 시 fade-in 효과만
      ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.from([left, middle, right].filter(Boolean), {
            opacity: 0,
            y: 10,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          })
          if (bottom) {
            gsap.from(bottom, { opacity: 0, y: 8, duration: 0.5, delay: 0.3, ease: 'power2.out' })
          }
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={containerRef}
      id="contact"
      className="relative bg-dark text-ink-inverse"
      data-section="footer"
    >
      {/* ─── [1] 다크 spacer + hairline sweep + status whisper ─── */}
      <div
        className="relative px-side-m md:px-side-t xl:px-side-d"
        style={{ height: '28vh' }}
      >
        {/* hairline — 중앙에서 좌우로 sweep */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-side-m md:px-side-t xl:px-side-d">
          <div
            data-footer-sweep
            className="h-px w-full"
            style={{ background: 'rgba(248, 247, 244, 0.12)' }}
          />
        </div>

        {/* status whisper — sweep 아래 정중앙 */}
        <p
          data-footer-status
          className="absolute left-1/2 top-1/2 mt-6 -translate-x-1/2 whitespace-nowrap font-mono text-[13px] uppercase tracking-[0.16em] text-ink-inverse/55"
        >
          {footer.status}
        </p>
      </div>

      {/* ─── [2] 한 줄 footer — 좌·중·우 분할 ─── */}
      <div className="px-side-m py-14 md:px-side-t md:py-16 xl:px-side-d">
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-5">
          {/* 좌: 이름 · 위치 */}
          <div
            data-footer-left
            className="font-mono text-base uppercase tracking-[0.08em] text-ink-inverse/80"
          >
            Park Minjoo
            <span className="mx-2 text-ink-inverse/40">·</span>
            {footer.location}
          </div>

          {/* 중: 보조 채널 (Mail · Notion · GitHub) */}
          <div data-footer-middle className="flex items-baseline gap-8">
            <a
              href={`mailto:${footer.email}`}
              className="group relative font-mono text-base uppercase tracking-[0.08em] text-ink-inverse/80 transition-colors hover:text-ink-inverse"
            >
              Mail
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
              />
            </a>
            {footer.links.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative font-mono text-base uppercase tracking-[0.08em] text-ink-inverse/80 transition-colors hover:text-ink-inverse"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
                />
              </a>
            ))}
          </div>

          {/* 우: Resume PDF — 유일한 강조 */}
          <a
            data-footer-right
            href={footer.resume.url}
            download
            className="group relative inline-flex items-baseline gap-2 font-mono text-base font-medium uppercase tracking-[0.08em] text-ink-inverse"
          >
            <span>{footer.resume.label}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
            />
          </a>
        </div>
      </div>

      {/* ─── [3] bottom micro — copyright ─── */}
      <div className="px-side-m pb-10 md:px-side-t xl:px-side-d">
        <p
          data-footer-bottom
          className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink-inverse/45"
        >
          {footer.copyright}
        </p>
      </div>
    </footer>
  )
}

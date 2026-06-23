'use client'

import { useEffect, useRef, useState } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { footer } from '@/data/footer'

/**
 * Footer — 좌: Thank You / 우: 연락처 (이메일 · GitHub · Notion 아이콘).
 *
 *   [포스터 → 푸터 호흡 + hairline sweep]  페이지 "닫힘" 신호
 *   [메인]  좌 거대 "Thank You"(+감사합니다) / 우 이메일·GitHub 주소·Notion 아이콘
 *   [bottom micro]  copyright
 *
 * 모션: gsap.from() = 정적 visible 보장 + 진입 시 fade-in. (텍스트 항상 보임)
 */

function NotionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.216-1.632z" />
    </svg>
  )
}

export function Footer() {
  const containerRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(footer.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback — clipboard 미지원 시 mailto 폴백
      window.location.href = `mailto:${footer.email}`
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()
    const ctx = gsap.context(() => {
      const sweep = container.querySelector('[data-footer-sweep]')
      const left = container.querySelector('[data-footer-left]')
      const right = container.querySelector('[data-footer-right]')
      const bottom = container.querySelector('[data-footer-bottom]')

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

      ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.from([left, right].filter(Boolean), {
            opacity: 0,
            y: 12,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          })
          if (bottom) gsap.from(bottom, { opacity: 0, y: 8, duration: 0.5, delay: 0.3, ease: 'power2.out' })
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
      {/* ─── 포스터 → 푸터 호흡 + hairline sweep ─── */}
      <div className="relative px-side-m md:px-side-t xl:px-side-d" style={{ height: '30vh' }}>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-side-m md:px-side-t xl:px-side-d">
          <div data-footer-sweep className="h-px w-full" style={{ background: 'rgba(248,247,244,0.12)' }} />
        </div>
      </div>

      {/* ─── 메인 — 좌 Thank You / 우 연락처 ─── */}
      <div className="px-side-m pb-24 md:px-side-t xl:px-side-d">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-14">
          {/* 좌 */}
          <div data-footer-left>
            <h2
              className="font-display font-medium leading-[0.9] tracking-tight text-ink-inverse"
              style={{ fontSize: 'clamp(56px, 9vw, 168px)' }}
            >
              {footer.thanks}
            </h2>
            <p className="mt-4 font-kr text-ink-inverse/78" style={{ fontSize: 'clamp(16px, 1.3vw, 22px)' }}>
              {footer.thanksKr}
            </p>
          </div>

          {/* 우 — 살짝 왼쪽으로 (margin-right) */}
          <div
            data-footer-right
            className="flex flex-col items-end gap-5 text-right"
            style={{ marginRight: 'clamp(2vw, 5vw, 8vw)' }}
          >
            {/* 메일 = 가장 큼 (연락 강조). 클릭 시 클립보드 복사 + COPIED 피드백 */}
            <a
              href={`mailto:${footer.email}`}
              onClick={handleCopyEmail}
              aria-label={copied ? '이메일 복사됨' : `${footer.email} 복사하기`}
              className="group relative font-mono normal-case tracking-[0.04em] text-ink-inverse transition-colors hover:text-ink-inverse"
              style={{ fontSize: 'clamp(22px, 2.2vw, 34px)' }}
            >
              {footer.email}
              <span
                aria-hidden
                className="absolute -bottom-1 right-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
              />
              {/* 복사 피드백 — 이메일 우측 위 floating */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-5 right-0 font-mono uppercase tracking-[0.16em] text-ink-inverse/70 transition-opacity duration-200"
                style={{
                  fontSize: '11px',
                  opacity: copied ? 1 : 0,
                }}
              >
                ✓ Copied
              </span>
            </a>
            <a
              href={footer.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative font-mono uppercase tracking-[0.08em] text-ink-inverse/80 transition-colors hover:text-ink-inverse"
              style={{ fontSize: 'clamp(15px, 1.05vw, 17px)' }}
            >
              {footer.githubLabel}
              <span
                aria-hidden
                className="absolute -bottom-1 right-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
              />
            </a>

            {/* 이력서 — 보기 / 다운로드 */}
            <div className="flex items-center gap-5">
              <a
                href={footer.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative font-kr text-ink-inverse/80 transition-colors hover:text-ink-inverse"
                style={{ fontSize: 'clamp(15px, 1.05vw, 17px)' }}
              >
                {footer.resumeLabel} · PDF 보기
                <span
                  aria-hidden
                  className="absolute -bottom-1 right-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
                />
              </a>
              <a
                href={footer.resume}
                download
                aria-label="이력서 PDF 다운로드"
                className="group relative font-mono uppercase tracking-[0.08em] text-ink-inverse/55 transition-colors hover:text-ink-inverse"
                style={{ fontSize: 'clamp(12px, 0.9vw, 14px)' }}
              >
                ↓ 다운로드
                <span
                  aria-hidden
                  className="absolute -bottom-1 right-0 h-px w-0 bg-ink-inverse transition-all duration-300 group-hover:w-full"
                />
              </a>
            </div>

            {/* Notion 전용 포트폴리오 — 살짝 키움 */}
            <a
              href={footer.notion}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Notion 전용 포트폴리오"
              className="group mt-3 inline-flex items-center gap-3 text-ink-inverse/80 transition-colors hover:text-ink-inverse"
            >
              <span
                className="font-mono uppercase tracking-[0.08em]"
                style={{ fontSize: 'clamp(14px, 1.05vw, 17px)' }}
              >
                Notion Portfolio
              </span>
              <NotionIcon className="h-14 w-14 transition-transform duration-300 group-hover:scale-105" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── bottom micro — copyright ─── */}
      <div className="px-side-m pb-12 md:px-side-t xl:px-side-d">
        <p
          data-footer-bottom
          className="font-mono uppercase tracking-[0.1em] text-ink-inverse/45"
          style={{ fontSize: '12px' }}
        >
          {footer.copyright}
        </p>
      </div>
    </footer>
  )
}

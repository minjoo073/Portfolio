'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import type { AppItem } from '@/lib/types/content'

interface Props {
  apps: AppItem[]
}

/**
 * App Launch PreviewArea — 영수증 메타포 확장 (영수증 *안의 영수증을 펼친 안쪽*)
 *
 * 정적 한 화면 = editorial 표지 컴포지션:
 *  - 영수증 *뒤* 거대 ghost 아이콘 워터마크 (opacity 0.07) = 매거진 표지 워터마크
 *  - 그룹 01 진입 시 GSAP intro reveal (한 번만, mount 시) = 정지화면이 *깨어남*
 *
 * 4 블록 + 절취선 3개:
 *  1. META strip — EDITION №01 / May 2026 · Android
 *  2. TITLE — 자린고비 (거대 serif) + Jaringobi (small caps mono) + QR
 *  3. LEADER 항목표 — CONCEPT / PLATFORM / ROLE / BUILD / DELIVERABLES / MECHANIC / STATUS
 *  4. 의도 statement + 바코드 ASCII + PLAY STORE CTA
 */
export function AppLaunchPreview({ apps }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const meta = container.querySelector('[data-al-meta]')
      const titleKr = container.querySelector('[data-al-title-kr]')
      const titleEn = container.querySelector('[data-al-title-en]')
      const qr = container.querySelector('[data-al-qr]')
      const leaderItems = container.querySelectorAll('[data-al-leader-item]')
      const statement = container.querySelector('[data-al-statement]')
      const barcode = container.querySelector('[data-al-barcode]')
      const footer = container.querySelector('[data-al-footer]')

      // 초기 상태
      gsap.set([meta, qr].filter(Boolean), { opacity: 0, y: 16 })
      gsap.set([titleKr, titleEn].filter(Boolean), { opacity: 0, y: 24 })
      gsap.set(leaderItems, { opacity: 0, y: 8 })
      gsap.set([statement, barcode, footer].filter(Boolean), { opacity: 0, y: 8 })

      // 진입 timeline — 정지화면이 깨어남
      // paused: true + ScrollTrigger 로 Stage 2 좌우 갈라짐과 동기화
      const tl = gsap.timeline({ paused: true })
      if (meta) tl.to(meta, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
      if (titleKr) tl.to(titleKr, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
      if (titleEn) tl.to(titleEn, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.38)
      if (qr) tl.to(qr, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.45)
      if (leaderItems.length > 0) {
        tl.to(leaderItems, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, 0.6)
      }
      if (statement) tl.to(statement, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.95)
      if (barcode) tl.to(barcode, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.05)
      if (footer) tl.to(footer, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.15)

      // Stage 2 좌우 갈라짐과 동기화: container 가 viewport 진입 시 play
      // 02→01 navigation 시 (이미 in view) 즉시 play fallback
      const rect = container.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0
      if (inView) {
        tl.play()
      } else {
        ScrollTrigger.create({
          trigger: container,
          start: 'top 85%',
          once: true,
          onEnter: () => tl.play(),
        })
      }
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col" data-preview="app-launch">
      {apps.map(app => {
        const entries: Array<[string, string | undefined]> = [
          ['CONCEPT', app.concept],
          ['PLATFORM', app.platform],
          ['ROLE', app.role],
          ['BUILD', app.buildDuration],
          ['DELIVERABLES', app.deliverables],
          ['MECHANIC', app.mechanic],
          ['STATUS', app.status],
        ]

        return (
          <article
            key={app.name}
            className="relative max-w-[720px] py-[3vh]"
          >
            {/* ─── Content wrapper ─── */}
            <div className="relative flex flex-col gap-[4vh]" style={{ zIndex: 10 }}>
              {/* ─── 1. META strip ─── */}
              <div
                data-al-meta
                className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60"
              >
                <span>EDITION №{app.editionNumber ?? '01'}</span>
                <span>
                  {app.releaseDate ?? app.publishedDate} · {app.platform ?? 'Android'}
                </span>
              </div>

              {/* ─── 2. TITLE — 좌: 한글 거대 serif + 영문 / 우: QR 코드 ─── */}
              <div className="flex items-start justify-between gap-8">
                <div className="flex flex-col gap-2">
                  <h4
                    data-al-title-kr
                    className="font-display font-medium leading-[0.95] tracking-tight text-ink-inverse text-[clamp(40px,4.2vw,60px)]"
                  >
                    {app.titleKr ?? app.name}
                  </h4>
                  <p
                    data-al-title-en
                    className="font-mono text-label uppercase tracking-[0.18em] text-ink-inverse/50"
                  >
                    {app.titleEn ?? app.name}
                  </p>
                </div>
                {/* QR 박스 — 자린고비 타이틀 옆 */}
                <div data-al-qr className="-mt-[10px] flex shrink-0 flex-col items-center gap-2">
                  {app.qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.qr}
                      alt={`Scan QR to install ${app.name}`}
                      className="size-[84px] rounded-md object-contain md:size-[92px]"
                    />
                  ) : (
                    <div
                      className="size-[96px] bg-ink-inverse md:size-[104px]"
                      aria-label={`Scan QR to install ${app.name}`}
                    />
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-inverse/55">
                    Scan to install
                  </span>
                </div>
              </div>

              {/* ─── 절취선 1 ─── */}
              <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

              {/* ─── 3. LEADER 항목표 ─── */}
              <dl className="flex flex-col gap-2.5">
                {entries.map(([key, value]) =>
                  value ? (
                    <div
                      key={key}
                      data-al-leader-item
                      className="flex items-baseline gap-3"
                    >
                      <dt className="w-[110px] shrink-0 font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55">
                        {key}
                      </dt>
                      <span
                        aria-hidden
                        className="mb-1 flex-1 border-b border-dotted border-ink-inverse/25"
                      />
                      <dd
                        className={
                          key === 'ROLE'
                            ? 'shrink-0 font-mono text-sm uppercase tracking-[0.08em] text-ink-inverse'
                            : 'shrink-0 font-mono text-label uppercase tracking-[0.08em] text-ink-inverse/85'
                        }
                      >
                        {value}
                      </dd>
                    </div>
                  ) : null
                )}
              </dl>

              {/* ─── 절취선 2 ─── */}
              <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

              {/* ─── 4-1. 의도 statement (light serif, italic 제거) ─── */}
              {app.intentStatement && (
                <p
                  data-al-statement
                  className="font-display font-light leading-[1.3] tracking-tight text-ink-inverse/85 text-[clamp(15px,1.2vw,20px)]"
                >
                  {app.intentStatement}
                </p>
              )}

              {/* ─── 절취선 3 ─── */}
              <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

              {/* ─── 4-2. 바코드 ASCII + PLAY STORE CTA ─── */}
              <div className="flex flex-col gap-3">
                <span
                  data-al-barcode
                  aria-hidden
                  className="overflow-hidden whitespace-nowrap font-mono text-base leading-none tracking-[0.05em] text-ink-inverse/75"
                >
                  ║▌║█║▌║║▌█║▌║█║║▌║▌█║║▌║█║▌║║▌█║▌║█║║▌║▌█
                </span>
                <div
                  data-al-footer
                  className="flex items-baseline justify-between"
                >
                  <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55">
                    PM-2026-CM-001
                  </span>
                  <a
                    href={app.storeUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex shrink-0 items-center gap-2 font-mono text-label uppercase tracking-[0.12em] text-ink-inverse transition-opacity hover:opacity-70"
                  >
                    <span>Play Store</span>
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}


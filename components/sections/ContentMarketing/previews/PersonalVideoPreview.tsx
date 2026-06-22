'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import type { ContentMedia } from '@/lib/types/content'

type Props = Extract<ContentMedia, { type: 'personal-video' }>

type ModalState =
  | { kind: 'inbound'; index: number }
  | { kind: 'video'; index: number }
  | null

/**
 * Personal Content PreviewArea — 03 fancy._ju.
 *
 * 01, 02 영수증 구조 *완전 통일* + INBOUND 만 03 특수 추가:
 *   META → TITLE+QR → 절취선 → LEADER (REACH 항목에 80K 통합) →
 *   절취선 → INBOUND (협업 제안) → 절취선 → REEL STRIP 4컷 →
 *   statement → 절취선 → 바코드 + footer
 *
 * 80K 거대 mono 제거 → LEADER 의 REACH 항목으로 통합 (영수증 톤 통일).
 */
export function PersonalVideoPreview(props: Props) {
  const {
    channel,
    videos,
    editionNumber,
    titleEn,
    period,
    totalReach,
    format,
    role,
    postsCount,
    intentStatement,
    instagramHandle,
    inbounds,
    qrImage,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!modal) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', handleKey)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = original
    }
  }, [modal])

  // 영수증 깨어남 intro reveal — 01/02 패턴 동일
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const meta = container.querySelector('[data-pp-meta]')
      const titleKrEl = container.querySelector('[data-pp-title-kr]')
      const titleEnEl = container.querySelector('[data-pp-title-en]')
      const qr = container.querySelector('[data-pp-qr]')
      const leaderItems = container.querySelectorAll('[data-pp-leader-item]')
      const inboundHeader = container.querySelector('[data-pp-inbound-header]')
      const inboundCards = container.querySelectorAll('[data-pp-inbound-card]')
      const reelLabel = container.querySelector('[data-pp-reel-label]')
      const thumbs = container.querySelectorAll('[data-pp-thumb]')
      const statement = container.querySelector('[data-pp-statement]')
      const barcode = container.querySelector('[data-pp-barcode]')
      const footer = container.querySelector('[data-pp-footer]')

      gsap.set([meta, titleEnEl, qr, inboundHeader, reelLabel, statement, barcode, footer].filter(Boolean), { opacity: 0, y: 14 })
      gsap.set([titleKrEl].filter(Boolean), { opacity: 0, y: 22 })
      gsap.set(leaderItems, { opacity: 0, y: 8 })
      gsap.set(inboundCards, { opacity: 0, y: 10 })
      gsap.set(thumbs, { opacity: 0, y: 16, scale: 0.96 })

      const tl = gsap.timeline({ paused: true })
      if (meta) tl.to(meta, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
      if (titleKrEl) tl.to(titleKrEl, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.2)
      if (titleEnEl) tl.to(titleEnEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.35)
      if (qr) tl.to(qr, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.42)
      if (leaderItems.length > 0) {
        tl.to(leaderItems, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, 0.6)
      }
      if (inboundHeader) tl.to(inboundHeader, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.0)
      if (inboundCards.length > 0) {
        tl.to(inboundCards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 1.1)
      }
      if (reelLabel) tl.to(reelLabel, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.4)
      if (thumbs.length > 0) {
        tl.to(thumbs, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' }, 1.5)
      }
      if (statement) tl.to(statement, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.85)
      if (barcode) tl.to(barcode, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.95)
      if (footer) tl.to(footer, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 2.05)

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

  // LEADER 항목 — 01/02 패턴 동일 (영수증 leader dots)
  // REACH 항목에 80K 통합 = "80K · 40편 이상" → 거대 mono 빼고 영수증 톤 유지
  const entries: Array<[string, string | undefined]> = [
    ['CHANNEL', `Instagram ${instagramHandle ?? channel.handle}`],
    ['REACH', `${totalReach ?? '80K'} · ${postsCount ?? '40편 이상'}`],
    ['PERIOD', period ?? '2026.03 — 05'],
    ['CADENCE', '주 3–4편'],
    ['FORMAT', format ?? 'VLOG · STUDY LOG'],
    ['ROLE', role ?? '기획 · 촬영 · 편집 (1인)'],
    ['STATUS', '운영 중'],
  ]

  return (
    <div ref={containerRef} className="flex flex-col" data-preview="personal-video">
      {/* ─── 01/02 영수증 구조 통일 ─── */}
      <article className="flex max-w-[720px] flex-col gap-[4vh] py-[3vh]">

        {/* ─── 1. META strip (01/02 동일) ─── */}
        <div
          data-pp-meta
          className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60"
        >
          <span>EDITION №{editionNumber ?? '03'} · FILE</span>
          <span>{format ?? 'VLOG · STUDY LOG'}</span>
        </div>

        {/* ─── 2. TITLE (01/02 동일 패턴) — 좌측 제목 + handle·80K sub + 우측 QR ─── */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h4
              data-pp-title-kr
              className="font-display font-medium leading-[0.95] tracking-tight text-ink-inverse text-[clamp(40px,4.2vw,60px)]"
            >
              SNS 운영
            </h4>
            <p
              data-pp-title-handle
              className="mt-1 font-mono text-sm tracking-[0.06em] text-ink-inverse"
            >
              {instagramHandle ?? channel.handle}
              <span className="text-ink-inverse/55"> · </span>
              <span style={{ fontFeatureSettings: '"zero" off' }}>{totalReach ?? '80K'}</span>
              <span className="text-ink-inverse/55"> · </span>
              {postsCount ?? '40편 이상'}
            </p>
          </div>

          {/* QR (01/02 동일 패턴) */}
          <div data-pp-qr className="-mt-[10px] flex shrink-0 flex-col items-center gap-2">
            {qrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImage}
                alt={`Scan QR to follow ${instagramHandle ?? channel.handle}`}
                className="size-[96px] object-contain md:size-[104px]"
              />
            ) : (
              <div
                className="size-[96px] bg-ink-inverse md:size-[104px]"
                aria-label={`Scan QR to follow ${instagramHandle ?? channel.handle}`}
              />
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-inverse/55">
              Scan to follow
            </span>
          </div>
        </div>

        {/* ─── 절취선 1 (01/02 동일) ─── */}
        <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

        {/* ─── 3. LEADER 항목표 (01/02 동일 패턴) — REACH 항목에 80K 통합 ─── */}
        <dl className="flex flex-col gap-2.5">
          {entries.map(([key, value]) =>
            value ? (
              <div
                key={key}
                data-pp-leader-item
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
                    key === 'REACH' || key === 'ROLE'
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

        {/* ─── 4. INBOUND — 03 특수 추가 (협업 제안, 영수증 톤 안에서) ─── */}
        {inbounds && inbounds.length > 0 && (
          <div className="flex flex-col gap-4">
            <div
              data-pp-inbound-header
              className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/65"
            >
              <span>★ 협업 제안</span>
              <span>{inbounds.length} 건</span>
            </div>
            <div className="flex flex-col gap-4">
              {inbounds.map((item, i) => (
                <div
                  key={item.id}
                  data-pp-inbound-card
                  className="flex flex-col"
                >
                  {i > 0 && (
                    <div
                      aria-hidden
                      className="mb-4 border-t border-dashed border-ink-inverse/20"
                    />
                  )}
                  <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-inverse/55">
                    <span>№{String(i + 1).padStart(2, '0')} · {item.receivedDate}</span>
                    <span className="font-medium text-ink-inverse/90">{item.category}</span>
                  </div>
                  {item.quote && (
                    <button
                      type="button"
                      onClick={() => setModal({ kind: 'inbound', index: i })}
                      className="group relative mt-3 pl-4 text-left transition-opacity hover:opacity-80"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0.5 left-0 w-px bg-ink-inverse/40 transition-colors group-hover:bg-ink-inverse/80"
                      />
                      <p className="font-kr text-[13px] leading-relaxed text-ink-inverse/90">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      {item.screenshot && (
                        <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-ink-inverse/55 group-hover:text-ink-inverse">
                          <span>DM 보기</span>
                          <span aria-hidden>→</span>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 절취선 3 ─── */}
        <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

        {/* ─── 5. REEL STRIP (02 동일 패턴) ─── */}
        {videos.length > 0 && (
          <>
            <div
              data-pp-reel-label
              className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55"
            >
              <span>REEL STRIP</span>
              <span>{videos.length} selected</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {videos.slice(0, 4).map((v, i) => (
                <button
                  key={i}
                  data-pp-thumb
                  type="button"
                  onClick={() => setModal({ kind: 'video', index: i })}
                  className="group relative overflow-hidden border border-ink-inverse/15 bg-ink-inverse/5 transition-all hover:border-ink-inverse/50 hover:bg-ink-inverse/10"
                  style={{ aspectRatio: '9 / 16' }}
                  aria-label={`Play reel ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnail}
                    alt={v.title ?? `Reel ${i + 1}`}
                    className="absolute inset-0 size-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-xl text-ink-inverse/40 transition-all group-hover:scale-110 group-hover:text-ink-inverse">
                    ▶
                  </span>
                  <span className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-inverse/85 mix-blend-difference">
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── 의도 statement (01/02 동일) ─── */}
        {intentStatement && (
          <p
            data-pp-statement
            className="font-display font-light leading-[1.3] tracking-tight text-ink-inverse/85 text-[clamp(15px,1.2vw,20px)]"
          >
            {intentStatement}
          </p>
        )}

        {/* ─── 절취선 4 ─── */}
        <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

        {/* ─── 바코드 + footer (01/02 동일) ─── */}
        <div className="flex flex-col gap-6">
          <span
            data-pp-barcode
            aria-hidden
            className="overflow-hidden whitespace-nowrap font-mono text-base leading-none tracking-[0.05em] text-ink-inverse/75"
          >
            ║▌║█║▌║║▌█║▌║█║║▌║▌█║║▌║█║▌║║▌█║▌║█║║▌║▌█
          </span>
          <div
            data-pp-footer
            className="flex items-baseline justify-between"
          >
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55">
              PM-2026-CM-003
            </span>
            <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/80">
              {instagramHandle ?? channel.handle}
            </span>
          </div>
        </div>
      </article>

      {/* ─── Modal — Portal 로 document.body 에 렌더 ─── */}
      {mounted && modal
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
              onClick={() => setModal(null)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative flex max-h-full flex-col gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-baseline justify-between gap-8 font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/70">
                  <span>
                    {modal.kind === 'inbound'
                      ? `№ 03-INBOUND-${String(modal.index + 1).padStart(2, '0')} · ${inbounds?.[modal.index]?.category ?? ''}`
                      : `№ 03-REEL-${String(modal.index + 1).padStart(2, '0')}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="inline-flex items-center gap-2 text-ink-inverse transition-opacity hover:opacity-70"
                    aria-label="닫기"
                  >
                    <span>닫기</span>
                    <span aria-hidden>×</span>
                  </button>
                </div>

                {modal.kind === 'inbound' && inbounds?.[modal.index]?.screenshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={inbounds[modal.index].screenshot!}
                    alt={`DM inbound ${modal.index + 1}`}
                    style={{
                      maxWidth: 'min(420px, 90vw)',
                      maxHeight: 'calc(100vh - 140px)',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : modal.kind === 'video' ? (
                  <div
                    className="overflow-hidden bg-black"
                    style={{
                      width: 'min(400px, 92vw)',
                      height: 'min(720px, calc(100vh - 140px))',
                    }}
                  >
                    {videos[modal.index].reelId ? (
                      <iframe
                        src={`https://www.instagram.com/reel/${videos[modal.index].reelId}/embed/`}
                        className="size-full"
                        allow="encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={videos[modal.index].title ?? `Reel ${modal.index + 1}`}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={videos[modal.index].thumbnail}
                        alt={videos[modal.index].title ?? `Reel ${modal.index + 1}`}
                        className="size-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-black p-8 font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60">
                    Screenshot unavailable
                  </div>
                )}

                <div className="flex items-baseline justify-between font-mono uppercase tracking-[0.12em] text-ink-inverse/55">
                  <span className="text-label">PM-2026-CM-003 · INSTAGRAM</span>
                  <span className="text-[10px]">ESC to close</span>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

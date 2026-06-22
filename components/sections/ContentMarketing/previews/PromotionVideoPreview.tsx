'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import type { ContentMedia, PromotionVideo } from '@/lib/types/content'

type Props = Extract<ContentMedia, { type: 'promotion-video' }>

/**
 * Promotion Video PreviewArea — 02 자린고비 티저 시리즈 (영수증 메타포 확장).
 *
 * 정적 영수증 + 영상 strip = 깨어남 모션 (mount 시 Stage 2 진입과 동기화):
 *   META → TITLE → IG/TikTok row → leader dots → REEL STRIP → 4컷 stagger → statement → 바코드
 *
 * ChannelRow = 박스 X, 아이콘 + 핸들 + 화살표 minimal row (사용자 톤 요청).
 */
export function PromotionVideoPreview(props: Props) {
  const {
    videos,
    editionNumber,
    titleKr,
    titleSubKr,
    titleEn,
    releaseDate,
    platforms,
    campaign,
    channel,
    format,
    role,
    tool,
    hook,
    status,
    intentStatement,
    instagramUrl,
    tiktokUrl,
    socialHandle,
    instagramHandle,
    tiktokHandle,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const [openVideo, setOpenVideo] = useState<{ video: PromotionVideo; index: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ESC 키로 모달 닫기 + body scroll lock
  useEffect(() => {
    if (!openVideo) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenVideo(null)
    }
    window.addEventListener('keydown', handleKey)
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = original
    }
  }, [openVideo])

  // 영수증 깨어남 intro reveal — Stage 2 진입과 동기화
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const meta = container.querySelector('[data-pv-meta]')
      const titleKrEl = container.querySelector('[data-pv-title-kr]')
      const titleSub = container.querySelector('[data-pv-title-sub]')
      const titleEnEl = container.querySelector('[data-pv-title-en]')
      const channelRows = container.querySelectorAll('[data-pv-channel-row]')
      const leaderItems = container.querySelectorAll('[data-pv-leader-item]')
      const reelLabel = container.querySelector('[data-pv-reel-label]')
      const thumbs = container.querySelectorAll('[data-pv-thumb]')
      const statement = container.querySelector('[data-pv-statement]')
      const barcode = container.querySelector('[data-pv-barcode]')
      const footer = container.querySelector('[data-pv-footer]')

      gsap.set([meta, titleEnEl, reelLabel, statement, barcode, footer].filter(Boolean), { opacity: 0, y: 14 })
      gsap.set([titleKrEl, titleSub].filter(Boolean), { opacity: 0, y: 22 })
      gsap.set(channelRows, { opacity: 0, x: 12 })
      gsap.set(leaderItems, { opacity: 0, y: 8 })
      gsap.set(thumbs, { opacity: 0, y: 16, scale: 0.96 })

      const tl = gsap.timeline({ paused: true })
      if (meta) tl.to(meta, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.05)
      if (titleKrEl) tl.to(titleKrEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.15)
      if (titleSub) tl.to(titleSub, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.25)
      if (titleEnEl) tl.to(titleEnEl, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.33)
      if (channelRows.length > 0) {
        tl.to(channelRows, { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, 0.38)
      }
      if (leaderItems.length > 0) {
        tl.to(leaderItems, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }, 0.55)
      }
      // REEL STRIP 앞당김 (1.15 → 0.85) — 사용자가 빨리 보고 싶어함
      if (reelLabel) tl.to(reelLabel, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.85)
      if (thumbs.length > 0) {
        tl.to(thumbs, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, 0.92)
      }
      if (statement) tl.to(statement, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.2)
      if (barcode) tl.to(barcode, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 1.3)
      if (footer) tl.to(footer, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 1.4)

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

  const entries: Array<[string, string | undefined]> = [
    ['CAMPAIGN', campaign],
    ['CHANNEL', channel],
    ['FORMAT', format],
    ['ROLE', role],
    ['TOOL', tool],
    ['HOOK', hook],
    ['STATUS', status],
  ]

  return (
    <div ref={containerRef} className="flex flex-col" data-preview="promotion-video">
      <article className="flex max-w-[720px] flex-col gap-[4vh] py-[3vh]">
        {/* ─── 1. META strip ─── */}
        <div
          data-pv-meta
          className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60"
        >
          <span>EDITION №{editionNumber ?? '02'}</span>
          <span>
            {releaseDate ?? 'May 2026'} · {platforms ?? 'IG / TikTok'}
          </span>
        </div>

        {/* ─── 2. TITLE — 좌: 자린고비/티저 시리즈 / 우: IG + TikTok 아이콘 row ─── */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h4
              data-pv-title-kr
              className="font-display font-medium leading-[0.95] tracking-tight text-ink-inverse text-[clamp(40px,4.2vw,60px)]"
            >
              {titleKr ?? '자린고비'}
            </h4>
            {titleSubKr && (
              <p
                data-pv-title-sub
                className="font-display font-light leading-[1.05] tracking-tight text-ink-inverse/85 text-[clamp(14px,1.3vw,18px)]"
              >
                {titleSubKr}
              </p>
            )}
            <p
              data-pv-title-en
              className="mt-1 font-mono text-label uppercase tracking-[0.18em] text-ink-inverse/50"
            >
              {titleEn ?? 'JARINGOBI · TEASER'}
            </p>
          </div>

          {/* IG/TikTok 아이콘 row = 박스 X, minimal */}
          <div className="flex w-[240px] shrink-0 flex-col gap-4 pt-2">
            <ChannelRow
              data-pv-channel-row
              icon={<InstagramIcon />}
              label="Instagram"
              handle={instagramHandle ?? socialHandle ?? '@4poor_project'}
              href={instagramUrl ?? '#'}
            />
            <ChannelRow
              data-pv-channel-row
              icon={<TikTokIcon />}
              label="TikTok"
              handle={tiktokHandle ?? socialHandle ?? '@4poor6'}
              href={tiktokUrl ?? '#'}
            />
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
                data-pv-leader-item
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

        {/* ─── 4컷 영상 strip (thumbnail + 클릭 → 모달 player) ─── */}
        <div
          data-pv-reel-label
          className="flex items-baseline justify-between font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55"
        >
          <span>REEL STRIP</span>
          <span>{videos.length} × 15s</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {videos.slice(0, 4).map((v, i) => (
            <button
              key={v.title}
              data-pv-thumb
              type="button"
              onClick={() => setOpenVideo({ video: v, index: i })}
              className="group relative overflow-hidden border border-ink-inverse/15 bg-ink-inverse/5 transition-all hover:border-ink-inverse/50 hover:bg-ink-inverse/10"
              style={{ aspectRatio: '9 / 16' }}
              aria-label={`Play ${v.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.thumbnail}
                alt={v.title}
                className="absolute inset-0 size-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-ink-inverse/40 transition-all group-hover:scale-110 group-hover:text-ink-inverse">
                ▶
              </span>
              <span className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-inverse/85 mix-blend-difference">
                №{String(i + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* ─── 의도 statement (light serif, italic 제거) ─── */}
        {intentStatement && (
          <p
            data-pv-statement
            className="font-display font-light leading-[1.3] tracking-tight text-ink-inverse/85 text-[clamp(15px,1.2vw,20px)]"
          >
            {intentStatement}
          </p>
        )}

        {/* ─── 절취선 3 ─── */}
        <div className="border-t border-dashed border-ink-inverse/25" aria-hidden />

        {/* ─── 바코드 + 영수증 번호 + CTA ─── */}
        <div className="flex flex-col gap-6">
          <span
            data-pv-barcode
            aria-hidden
            className="overflow-hidden whitespace-nowrap font-mono text-base leading-none tracking-[0.05em] text-ink-inverse/75"
          >
            ║▌║█║▌║║▌█║▌║█║║▌║▌█║║▌║█║▌║║▌█║▌║█║║▌║▌█
          </span>
          <div
            data-pv-footer
            className="flex items-baseline justify-between"
          >
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-inverse/55">
              PM-2026-CM-002
            </span>
            <span className="font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/80">
              {instagramHandle ?? socialHandle ?? '@4poor_project'}
            </span>
          </div>
        </div>
      </article>

      {/* ─── Modal Player — Portal 로 document.body 에 렌더 (transform parent 영향 회피) ─── */}
      {mounted && openVideo
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
              onClick={() => setOpenVideo(null)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative flex max-h-full flex-col gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 영수증 톤 헤더 */}
                <div className="flex items-baseline justify-between gap-8 font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/70">
                  <span>
                    № 02-{String(openVideo.index + 1).padStart(2, '0')} · {openVideo.video.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenVideo(null)}
                    className="inline-flex items-center gap-2 text-ink-inverse transition-opacity hover:opacity-70"
                    aria-label="Close"
                  >
                    <span>Close</span>
                    <span aria-hidden>×</span>
                  </button>
                </div>

                {/* iframe player */}
                <div
                  className="overflow-hidden bg-black"
                  style={{
                    width: 'min(340px, 90vw)',
                    height: 'min(605px, calc(100vh - 140px))',
                  }}
                >
                  {openVideo.video.videoId ? (
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${openVideo.video.videoId}`}
                      className="size-full"
                      allow="encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={openVideo.video.title}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60">
                      Video unavailable
                    </div>
                  )}
                </div>

                {/* 영수증 톤 푸터 */}
                <div className="flex items-baseline justify-between font-mono uppercase tracking-[0.12em] text-ink-inverse/55">
                  <span className="text-label">PM-2026-CM-002 · TIKTOK</span>
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

/** 채널 row — 박스 X, 아이콘 + 핸들 + 화살표 minimal */
function ChannelRow({
  icon,
  label,
  handle,
  href,
  ...rest
}: {
  icon: React.ReactNode
  label: string
  handle: string
  href: string
} & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-center gap-3 transition-opacity hover:opacity-80"
      {...rest}
    >
      <span className="shrink-0 text-ink-inverse/85 transition-colors group-hover:text-ink-inverse">
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-inverse/55">
          {label}
        </span>
        <span className="font-mono text-sm tracking-[0.02em] text-ink-inverse truncate">
          {handle}
        </span>
      </div>
      <span
        aria-hidden
        className="font-mono text-base text-ink-inverse/50 transition-all group-hover:text-ink-inverse group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  )
}

function InstagramIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.62 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.66-.1z" />
    </svg>
  )
}

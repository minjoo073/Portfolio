'use client'

import { useEffect, useRef } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { visualWorks } from '@/data/visualWorks'
import { VisualItem } from './VisualItem'

/**
 * Visual Works 섹션 — 04 (절제, "이런 작업도 해봤다").
 *
 * 시퀀스:
 *  [transition] hairline sweep (좌→우) — 03 → 04 신호
 *  [label]      Stacked 좌측 — 04 / Visual Works / 작업물 X점
 *  [track]      sticky + scrub horizontal:
 *               포스터 8장 (각각 카드, 60vh height) + 배너 stack column 1개 (모든 배너 한 view)
 *  [exit]       15vh 호흡
 */
export function VisualWorks() {
  const posters = visualWorks.filter(v => v.category === 'poster')
  const banners = visualWorks.filter(v => v.category === 'banner')
  const total = visualWorks.length

  const outerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const transitionRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  // hairline sweep transition (03 → 04) — sticky 로 *제자리에서 그려지는* 챕터 전환
  // outer 180vh / sticky 100vh → 잡힘 80vh. 선이 화면 가운데 머문 채 좌→우로 그려지고
  // 라벨이 페이드 → 다 그려진 뒤 짧게 hold 후 풀림. (단순 scrub 1개 — 핀+스냅 조합 아님)
  useEffect(() => {
    const el = transitionRef.current
    if (!el) return

    registerGsap()
    const line = el.querySelector<HTMLElement>('[data-vw-sweep]')
    const label = el.querySelector<HTMLElement>('[data-vw-sweep-label]')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      if (line) gsap.set(line, { scaleX: 1 })
      if (label) gsap.set(label, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      if (!line) return
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
      if (label) gsap.set(label, { opacity: 0, y: 8 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=80%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      tl.to(line, { scaleX: 1, ease: 'power2.inOut', duration: 0.7 }, 0)
      if (label) tl.to(label, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0.45)

      gsap.delayedCall(0.4, () => ScrollTrigger.refresh())
    }, el)

    return () => ctx.revert()
  }, [])

  // 라벨 stagger fade-in (onEnter 1회)
  useEffect(() => {
    const el = labelRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()
    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll('[data-vw-label-line]')
      gsap.set(lines, { opacity: 0, y: 12 })

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(lines, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          })
        },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  // sticky + ScrollTrigger scrub horizontal
  useEffect(() => {
    const outer = outerRef.current
    const sticky = stickyRef.current
    const track = trackRef.current
    if (!outer || !sticky || !track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    let st: ScrollTrigger | null = null

    const setup = () => {
      const trackWidth = track.scrollWidth
      const viewportWidth = window.innerWidth
      const distance = Math.max(0, trackWidth - viewportWidth)

      // outer height = sticky 100vh + horizontal distance + 30vh 시작 호흡
      // (start 'top top+=30%' 로 30vh animation 정지 → 그 만큼 추가 안 하면 끝까지 못 감)
      outer.style.height = `${100 + (distance / window.innerHeight) * 100 + 30}vh`

      st?.kill()
      st = ScrollTrigger.create({
        trigger: outer,
        // start 늦춤 — outer top 도달 후 *30vh 호흡* (라벨 + 포스터 01 visible) → 가로 슬라이드 시작
        start: 'top top+=30%',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
        animation: gsap.to(track, { x: -distance, ease: 'none' }),
      })
    }

    const ctx = gsap.context(setup, outer)

    // image load 후 *setup 자체 재호출* — trackWidth 변경 시 outer.style.height + animation distance 모두 재계산
    // 단순 ScrollTrigger.refresh 만으로는 setup() 안에서 결정된 distance 값이 안 바뀜
    const reSetup = () => {
      ctx.add(setup)
      ScrollTrigger.refresh()
    }

    gsap.delayedCall(0.4, reSetup)
    gsap.delayedCall(1.2, reSetup)
    gsap.delayedCall(2.5, reSetup)

    const images = track.querySelectorAll('img')
    let loaded = 0
    const onImgLoad = () => {
      loaded++
      if (loaded === images.length) reSetup()
    }
    images.forEach(img => {
      if (img.complete) onImgLoad()
      else img.addEventListener('load', onImgLoad, { once: true })
    })

    const onResize = () => reSetup()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <>
      {/* ─── hairline sweep transition — 선 sweep 완료 후 라벨 등장 (화면 전환 명확) ─── */}
      <div
        ref={transitionRef}
        className="relative bg-dark"
        style={{ height: '180vh' }}
        aria-hidden
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-5 px-side-m md:px-side-t xl:px-side-d">
          <span
            data-vw-sweep-label
            className="font-mono text-label uppercase tracking-[0.2em] text-ink-inverse/55"
            style={{ opacity: 0 }}
          >
            04 — Visual Works
          </span>
          <div
            data-vw-sweep
            className="h-[2px] w-full bg-ink-inverse/45"
            style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
          />
        </div>
      </div>

      {/* ─── Visual Works 메인 ─── */}
      <section
        id="visual"
        className="relative bg-dark text-ink-inverse"
        data-section="visual-works"
      >
        {/* ─── B 라벨 Stacked 좌측 ─── */}
        <div
          ref={labelRef}
          className="px-side-m pt-[14vh] md:px-side-t xl:px-side-d"
        >
          <div className="flex flex-col gap-2">
            <span
              data-vw-label-line
              className="font-mono text-[13px] uppercase tracking-[0.18em] text-ink-inverse/55"
            >
              04
            </span>
            <h2
              data-vw-label-line
              className="font-mono text-xl font-medium uppercase tracking-[0.08em] text-ink-inverse md:text-2xl"
            >
              Visual Works
            </h2>
            <span
              data-vw-label-line
              className="font-mono text-[13px] uppercase tracking-[0.12em] text-ink-inverse/55"
            >
              작업물 {total}점 · 포스터 {posters.length} · 배너 {banners.length}
            </span>
          </div>
        </div>

        {/* ─── sticky + scrub horizontal track ─── */}
        <div ref={outerRef} className="relative mt-[3vh]">
          <div
            ref={stickyRef}
            className="sticky top-0 flex items-center overflow-hidden bg-dark"
            style={{ height: '100vh' }}
          >
            <div
              ref={trackRef}
              className="flex shrink-0 items-center gap-[4vw] px-side-m md:px-side-t xl:px-side-d"
              data-horizontal-track
              style={{ willChange: 'transform' }}
            >
              {/* 시작 호흡 — 역스크롤 시 포스터 01 완전 visible 후 sticky 풀림 보장 */}
              <div className="shrink-0" style={{ width: '8vw' }} aria-hidden />

              {/* 포스터 8장 — 각 카드 */}
              {posters.map(item => (
                <VisualItem key={item.id} item={item} total={total} />
              ))}

              {/* 배너 grid — 2 col × N row (2개씩 위아래 = 한 view 안 그리드) */}
              {banners.length > 0 && (
                <BannerGrid banners={banners} total={total} />
              )}

              {/* 끝 호흡 — 배너 grid 완전 visible 보장 + footer 진입 buffer */}
              <div className="shrink-0" style={{ width: '60vw' }} aria-hidden />
            </div>
          </div>
        </div>

        {/* 다음 섹션 진입 호흡 */}
        <div style={{ height: '15vh' }} aria-hidden />
      </section>
    </>
  )
}

/**
 * BannerGrid — 배너 N장을 *2 col grid* (2개씩 위아래) 한 슬롯에 한 view 안 그리드.
 *   - slot width 95vh = 각 col ≈ 46vh, 각 배너 cell aspect 16:9 → cell height ≈ 26vh
 *   - 4장 = 2 row × 2 col, 3장 = 2 col grid 마지막 빈 cell
 *   - object-cover + aspect 16:9 cell = 자연 fit (잘림 없음, 확대 없음)
 */
function BannerGrid({
  banners,
  total,
}: {
  banners: Array<{ id: string; index: number; title: string; thumbnail: string; category: 'poster' | 'banner' }>
  total: number
}) {
  return (
    <article
      className="group flex shrink-0 flex-col gap-3"
      data-visual-item
      data-category="banner-grid"
      style={{ width: '160vh' }}
    >
      {/* CSS columns masonry — 각 배너 width 100%, height 자연 비율, frame X */}
      <div className="columns-2 gap-3 [column-fill:balance]">
        {banners.map(item => (
          <div
            key={item.id}
            className="relative mb-3 break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnail}
              alt={`${item.title} — Banner`}
              className="block w-full h-auto bg-dark-soft"
            />
            {/* mini caption — 좌측 상단 */}
            <span className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-inverse/85 mix-blend-difference">
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {/* hairline caption — Banners — 4점 / 09–12 / 12 */}
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-inverse/55">
        <span>
          Banners <span className="text-ink-inverse/35">— {banners.length}점</span>
        </span>
        <span>
          {String(banners[0].index).padStart(2, '0')}–
          {String(banners[banners.length - 1].index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </article>
  )
}

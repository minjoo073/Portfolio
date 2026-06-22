'use client'

import { useEffect, useRef, useState } from 'react'
import { contentBody, contentGroups } from '@/data/content'
import { Receipt } from './Receipt'
import { PreviewArea } from './PreviewArea'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { useLenis } from '@/lib/hooks/useLenis'

/**
 * Content & Marketing — 좌 고정 / 우 스크롤 구조 (2026-06-22 재설계).
 *
 *   [1] 진입부: "(Content ——— & Marketing)" 선이 좌우로 벌어짐 + 한글 paragraph.
 *       (영수증 드롭 모션은 폐기 — 영수증의 첫 등장은 Stage 2 좌측 고정 레일)
 *   [2] 본문: 좌측 영수증 sticky 고정 + 우측에 01·02·03 콘텐츠를 자연 높이로 세로 스택.
 *       - 우측 자연 스크롤 (핀/스냅/내부 overflow 스크롤 전부 폐기 → 버벅임 구조적 제거)
 *       - 진입 시 좌우 "갈라짐" clip-path 리빌 유지
 *       - scrollspy(IntersectionObserver): 우측 현재 그룹 → 좌측 라벨 진해짐
 *       - 좌측 라벨 hover → 해당 그룹으로 스크롤 점프(부드럽게)
 */
export function ContentMarketing() {
  const [activeId, setActiveId] = useState(contentGroups[0].id)
  const stage1OuterRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  // ── [1] 선 벌어짐 + paragraph 리빌 (scrub) + [2] 갈라짐 clip 리빌 ──────────
  useEffect(() => {
    const outer = stage1OuterRef.current
    if (!outer) return

    registerGsap()

    const section = outer.closest('section')
    const paragraph = outer.querySelector('[data-cm-paragraph]')
    const line = outer.querySelector('[data-cm-line]')
    const stage2 = section?.querySelector('[data-cm-stage2-wrap]')
    const left = section?.querySelector('[data-cm-stage2-left-reveal]')
    const right = section?.querySelector('[data-cm-stage2-right]')

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // reduced-motion: 정적 표시(모션 skip) — 콘텐츠 숨김 방지
    if (reduced) {
      if (paragraph) gsap.set(paragraph, { opacity: 1, y: 0 })
      if (line) gsap.set(line, { width: '60vw' })
      gsap.set([left, right].filter(Boolean), { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }

    const ctx = gsap.context(() => {
      if (!paragraph || !line) return

      // 초기 상태
      gsap.set(line, { width: 0 })
      gsap.set(paragraph, { opacity: 0, y: 20 })
      if (left) gsap.set(left, { clipPath: 'inset(0% 0% 0% 100%)' })
      if (right) gsap.set(right, { clipPath: 'inset(0% 100% 0% 0%)' })

      // 선 벌어짐 + paragraph — *sticky 잡힌 구간(70vh)* 안에서 완료 후 hold.
      // outer 170vh, sticky 100vh → sticky 잡힘 = 70vh.
      // ScrollTrigger end='+=70%' = 잡힘 구간과 일치 → 타임라인 progress 1.0 = sticky 풀림 지점.
      //   선 0~0.55, 문단 0.28~0.8 에 완료 → 0.8~1.0 동안 *완전히 벌어진 채 hold* 후 풀림.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: '+=70%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      tl.to(line, { width: '60vw', ease: 'power3.inOut', duration: 0.55 }, 0)
      tl.to(paragraph, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.52 }, 0.28)

      // Stage 2 좌우 갈라짐 — 진입 시 1회 (CSS sticky 와 충돌 없는 단순 clip 리빌)
      if (stage2 && left && right) {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: stage2,
            start: 'top 80%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true,
          },
        })
        tl2.to(left, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0)
        tl2.to(right, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0)
      }

      gsap.delayedCall(0.3, () => ScrollTrigger.refresh())
    }, outer)

    return () => ctx.revert()
  }, [])

  // ── scrollspy: 우측 현재 그룹 감지 → 좌측 라벨 active ─────────────────────
  useEffect(() => {
    const rightCol = rightColRef.current
    if (!rightCol) return
    const sections = Array.from(rightCol.querySelectorAll<HTMLElement>('[data-cm-group]'))
    if (!sections.length) return

    // 뷰포트 중앙 10% 밴드에 들어온 그룹을 active 로
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting)
        if (!hit.length) return
        const id = hit[hit.length - 1].target.getAttribute('data-cm-group')
        if (id) setActiveId((prev) => (prev === id ? prev : id))
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // 좌측 라벨 hover → 해당 그룹으로 스크롤 점프
  const jumpToGroup = (id: string) => {
    const el = rightColRef.current?.querySelector<HTMLElement>(`[data-cm-group="${id}"]`)
    if (!el) return
    const offset = -window.innerHeight * 0.35 // 그룹이 뷰포트 중앙 밴드에 오도록
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset, duration: 0.8 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section
      id="content"
      className="relative bg-dark text-ink-inverse"
      data-section="content-marketing"
    >
      {/* ─── [1] 진입부 — 선 벌어짐 + paragraph (sticky 100vh) ─── */}
      <div ref={stage1OuterRef} className="relative" style={{ height: '170vh' }}>
        <div className="sticky top-0 h-screen w-full px-side-m md:px-side-t xl:px-side-d">
          {/* paragraph — 상단 */}
          <p
            data-cm-paragraph
            className="absolute left-1/2 max-w-[720px] text-center font-kr text-body-l leading-relaxed text-ink-inverse/95"
            style={{
              top: '28vh',
              transform: 'translateX(-50%)',
              width: 'min(90vw, 720px)',
              opacity: 0,
              zIndex: 5,
            }}
          >
            {contentBody.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>

          {/* 분할 라벨 — 가운데, 선이 좌우로 벌어짐 */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center font-mono text-base md:text-lg uppercase tracking-[0.08em] text-ink-inverse/95"
            style={{ top: '50vh', transform: 'translateY(-50%)', zIndex: 10 }}
          >
            <span data-cm-label-left>(Content&nbsp;</span>
            <div data-cm-line className="h-px bg-ink-inverse/60" style={{ width: 0 }} />
            <span data-cm-label-right>&nbsp;&amp; Marketing)</span>
          </div>
        </div>
      </div>

      {/* Stage1(선) → Stage2 호흡 */}
      <div aria-hidden style={{ height: '24vh' }} />

      {/* ─── [2] 좌 고정 영수증 + 우 스크롤 콘텐츠 ─── */}
      <div
        data-cm-stage2-wrap
        className="relative mx-auto grid max-w-[1680px] grid-cols-12 gap-gutter-d px-side-m pb-[8vh] md:px-side-t xl:px-side-d"
        data-stage="2"
      >
        {/* 좌 — Receipt sticky 고정 (clip: 가운데 → 좌측 으로 열림) */}
        <div data-cm-stage2-left className="col-span-12 md:col-span-6 md:pr-14">
          <div className="md:sticky md:top-0">
            <div
              data-cm-stage2-left-reveal
              className="flex items-center md:h-screen-dvh"
              style={{ willChange: 'clip-path' }}
            >
              <Receipt
                groups={contentGroups}
                variant="stage2"
                activeId={activeId}
                onHover={jumpToGroup}
              />
            </div>
          </div>
        </div>

        {/* 우 — 01·02·03 콘텐츠 세로 스택, 자연 스크롤 (clip: 가운데 → 우측 으로 열림) */}
        <div
          ref={rightColRef}
          data-cm-stage2-right
          className="col-span-12 md:col-span-6 md:pl-14"
          style={{ willChange: 'clip-path' }}
        >
          {contentGroups.map((group, i) => (
            <div
              key={group.id}
              data-cm-group={group.id}
              className={i === 0 ? 'pt-[30vh] md:pt-[40vh]' : 'pt-[24vh] md:pt-[32vh]'}
            >
              <PreviewArea group={group} />
            </div>
          ))}
          {/* exit 호흡 — 마지막 그룹이 좌측 고정된 채 끝까지 보인 뒤 섹션 이탈 */}
          <div aria-hidden className="h-[36vh] md:h-[44vh]" />
        </div>
      </div>

      {/* Stage2 → 다음 섹션(Visual Works) 호흡 — 03 충분히 보고 + sweep 진입 전 여백 */}
      <div aria-hidden style={{ height: '24vh' }} />
    </section>
  )
}

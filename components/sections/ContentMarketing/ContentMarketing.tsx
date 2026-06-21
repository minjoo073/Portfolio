'use client'

import { useEffect, useRef, useState } from 'react'
import { contentBody, contentGroups } from '@/data/content'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { Receipt } from './Receipt'
import { PreviewArea } from './PreviewArea'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { useLenis } from '@/lib/hooks/useLenis'

/**
 * Content & Marketing — 옵션 D 2단계 시퀀스.
 *
 *   [0] 진입 단독 라벨 — viewport 중앙 (About Me 패턴)
 *   [1] 한글 paragraph + 분할 라벨 + Receipt (large, viewport 가운데)
 *       Phase 3 GSAP: 영수증이 펄럭이며 떨어져 착지
 *   [2] Receipt (compact, 좌) + PreviewArea (우)
 *       Receipt 항목 hover → active group 변경 → PreviewArea 갱신
 *
 * Phase 2: 정적 마크업 + useState 호버 인터랙션.
 * Phase 3: 영수증 떨어짐 모션, [1]→[2] 전환 모션 (좌측 이동·축소 + preview slide-in).
 */
export function ContentMarketing() {
  const [activeId, setActiveId] = useState(contentGroups[0].id)
  const activeGroup = contentGroups.find(g => g.id === activeId) ?? contentGroups[0]
  const stage1OuterRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  // snap 진행 추적 — ±1 그룹 제한 위해 직전 정착 그룹 idx 유지
  const lastSnapIdxRef = useRef(0)
  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  // Stage [1] sticky + scrub timeline — RayRayLab 영수증 패턴
  // 0~30%: paragraph + 좌우 라벨 등장
  // 30~60%: 중앙 선 scaleX 0 → 1 (좌→우)
  // 60~100%: 영수증 drop (opacity + translateY)
  useEffect(() => {
    const outer = stage1OuterRef.current
    if (!outer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    const ctx = gsap.context(() => {
      const paragraph = outer.querySelector('[data-cm-paragraph]')
      const labelL = outer.querySelector('[data-cm-label-left]')
      const labelR = outer.querySelector('[data-cm-label-right]')
      const line = outer.querySelector('[data-cm-line]')
      const receipt = outer.querySelector('[data-cm-receipt]')
      const receiptLines = receipt?.querySelectorAll('[data-cm-receipt-line]')
      const nextEntryLine = outer.querySelector('[data-cm-next-entry-line]')
      const nextEntryCaption = outer.querySelector('[data-cm-next-entry-caption]')
      const section = outer.closest('section')
      const stage2 = section?.querySelector('[data-cm-stage2-wrap]')
      const stage2Left = section?.querySelector('[data-cm-stage2-left]')
      const stage2Right = section?.querySelector('[data-cm-stage2-right]')
      if (!paragraph || !labelL || !labelR || !line || !receipt) return

      // 초기 상태
      gsap.set(paragraph, { opacity: 0, y: 20 })
      gsap.set(line, { width: 0 })
      gsap.set(receipt, { maxHeight: 0 })
      if (nextEntryLine) gsap.set(nextEntryLine, { width: 0, opacity: 0 })
      if (nextEntryCaption) gsap.set(nextEntryCaption, { opacity: 0 })
      if (stage2Left) gsap.set(stage2Left, { clipPath: 'inset(0% 0% 0% 100%)' })
      if (stage2Right) gsap.set(stage2Right, { clipPath: 'inset(0% 100% 0% 0%)' })

      // outer height 250vh = sticky 100vh + 진행 150vh
      // sticky 잡힘 = outer top 0 ~ -150vh (timeline 0 ~ 0.6)
      // sticky 풀린 후 자연 scroll = -150 ~ -250vh (timeline 0.6 ~ 1.0, 100vh)
      // 단계:
      //  0 ~ 0.4   Stage 1 자라남 (sticky 잡힘, 100vh)
      //  0.4 ~ 0.6 정착 hold *짧게* (sticky 잡힘 끝, 50vh — 영수증 *완전 visible 한 번 봄*)
      //  0.6 = sticky 풀림 = 영수증 *자연 위로 이동 시작*
      //  0.62 ~ 0.95 영수증 자연 위로 이동 + *잉크 stagger 동시* (= 사용자 의도, 83vh)
      //  0.95 ~ 1.0 hairline + 캡션 (viewport 하단)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: '+=380%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      // Stage 1 자라남 — 380vh outer 안 sticky 풀림 = progress 0.74
      // 자라남 끝 ≤ 0.74 보장 (sticky 잡힌 동안 자라남 완료)
      //   선 0 ~ 0.25 (천천히 좌→우 벌어짐)
      //   paragraph 0.28 ~ 0.55
      //   receipt 0.3 ~ 0.7 (자라남 끝 = sticky 풀림 직전)
      tl.to(line, { width: '60vw', ease: 'power3.inOut', duration: 0.25 }, 0)
      tl.to(paragraph, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.27 }, 0.28)
      tl.to(receipt, { maxHeight: '90vh', ease: 'power2.out', duration: 0.4 }, 0.3)

      // 잉크 회수 — 자라남 끝 (0.7) → hold 0.15 → sticky 풀림 (0.74) 후 잉크 fade 시작 (0.85)
      // sticky 풀림 후 영수증 자연 위로 이동 + 잉크 fade 동시 진행
      if (receiptLines && receiptLines.length > 0) {
        tl.to(receiptLines, {
          opacity: 0,
          filter: 'blur(1.2px)',
          stagger: { each: 0.012, from: 'start' },
          ease: 'power1.in',
        }, 0.85)
      }


      // 영수증 사라진 후 hairline + 캡션
      if (nextEntryLine) {
        tl.to(nextEntryLine, { width: '30vw', opacity: 1, ease: 'power2.out' }, 0.95)
      }
      if (nextEntryCaption) {
        tl.to(nextEntryCaption, { opacity: 1, ease: 'power1.out' }, 0.97)
      }

      // Stage 2 — 가운데에서 양쪽 갈라짐 (한 번만 play, 역방향 스크롤 시 reveal 유지)
      // scrub 사용 시 역방향 시 clip-path 다시 닫힘 → Stage 1 영수증/Spacer 잠깐 visible
      // → toggleActions: 'play none none none' = 한 번 열리면 영영 유지
      if (stage2 && stage2Left && stage2Right) {
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: stage2,
            start: 'top 80%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true,
          },
        })
        tl2.to(stage2Left, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0)
        tl2.to(stage2Right, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0)

        // Stage 2 pin + snap — pin 영역 *적정* (momentum 흡수 + 단축 균형)
        // pin 영역 200vh = 그룹당 67vh (강 swipe momentum 50vh 정도 흡수 가능)
        // snap delay 0.03 + duration 0.2~0.35 = 가장 빠른 정착
        // snapTo ±1 clamp = momentum 으로 1 그룹 통과 시도 시 clamp 가 다음 그룹만 허용
        ScrollTrigger.create({
          trigger: stage2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          start: 'top top',
          end: '+=200%',
          invalidateOnRefresh: true,
          snap: {
            snapTo: (progress) => {
              const groupCount = contentGroups.length - 1
              const exact = progress * groupCount
              const desired = Math.round(exact)
              const last = lastSnapIdxRef.current
              const clamped = Math.max(last - 1, Math.min(last + 1, desired))
              return clamped / groupCount
            },
            duration: { min: 0.2, max: 0.35 },
            ease: 'power2.inOut',
            delay: 0.03,
            directional: false,
          },
          onSnapComplete: (self) => {
            const groupIndex = Math.round(self.progress * (contentGroups.length - 1))
            lastSnapIdxRef.current = groupIndex
            const newId = contentGroups[groupIndex].id
            setActiveId(prev => (prev === newId ? prev : newId))
          },
        })
      }

      // Lenis 와 sync 위해 살짝 지연 후 refresh
      gsap.delayedCall(0.3, () => ScrollTrigger.refresh())
    }, outer)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="content"
      className="relative bg-dark text-ink-inverse"
      data-section="content-marketing"
    >

      {/* ─── [1] sticky 100vh 안 — 라벨 가운데 *고정*, paragraph 위, 영수증 bottom 부터 자라남 ─── */}
      <div
        ref={stage1OuterRef}
        className="relative"
        style={{ height: '380vh' }}
      >
        <div className="sticky top-0 h-screen w-full px-side-m md:px-side-t xl:px-side-d">
          {/* paragraph — absolute 위쪽 고정 */}
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

          {/* 분할 라벨 — absolute 가운데 *고정* (z-index 10, 영수증 위 통과 시 visible) */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center font-mono text-base md:text-lg uppercase tracking-[0.08em] text-ink-inverse/95"
            style={{
              top: '50vh',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <span data-cm-label-left>(Content&nbsp;</span>
            <div
              data-cm-line
              className="h-px bg-ink-inverse/60"
              style={{ width: 0 }}
            />
            <span data-cm-label-right>&nbsp;&amp; Marketing)</span>
          </div>

          {/* Receipt — wrapper top: 50vh (라벨 위치 고정) + maxHeight 자라남 *아래로* + flex-end (푸터부터 visible) */}
          <div
            data-cm-receipt
            className="absolute left-1/2"
            style={{
              top: '50vh',
              transform: 'translateX(-50%)',
              maxHeight: 0,
              overflow: 'hidden',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div className="receipt-sway">
              <Receipt groups={contentGroups} variant="stage1" />
            </div>
          </div>

          {/* 가운데 hairline + next entry 캡션 — viewport 하단 (다음 챕터 신호) */}
          <div
            data-cm-next-entry-line
            className="absolute left-1/2 h-px bg-ink-inverse/40"
            style={{
              top: '88vh',
              transform: 'translate(-50%, -50%)',
              width: 0,
              opacity: 0,
              zIndex: 6,
            }}
          />
          <span
            data-cm-next-entry-caption
            className="absolute font-mono text-label uppercase tracking-[0.12em] text-ink-inverse/60"
            style={{
              top: 'calc(88vh + 1.2em)',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0,
              zIndex: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {'// next entry — 02'}
          </span>
        </div>
      </div>

      {/* ─── Spacer 100vh — 영수증 자연 사라지고 Stage 2 진입 사이 빈 영역 ─── */}
      <div aria-hidden style={{ height: '100vh' }} />

      {/* ─── [2] Receipt compact (좌) + PreviewArea (우) — 가운데에서 양쪽 갈라짐 ─── */}
      <div
        data-cm-stage2-wrap
        className="relative grid min-h-screen-dvh grid-cols-12 gap-gutter-d px-side-m py-[10vh] md:px-side-t xl:px-side-d"
        data-stage="2"
      >
        {/* 좌 — Receipt compact (clip-path: 가운데 → 좌측 으로 열림) */}
        <div
          data-cm-stage2-left
          className="col-span-12 md:col-span-5 md:pr-6"
          style={{ clipPath: 'inset(0% 0% 0% 100%)', willChange: 'clip-path' }}
        >
          <div className="sticky" style={{ top: '6vh' }}>
            <Receipt
              groups={contentGroups}
              variant="stage2"
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>
        </div>

        {/* 우 — PreviewArea (clip-path: 가운데 → 우측 으로 열림) */}
        <div
          data-cm-stage2-right
          className="col-span-12 md:col-span-7 md:pl-6"
          style={{ clipPath: 'inset(0% 100% 0% 0%)', willChange: 'clip-path' }}
        >
          <PreviewArea group={activeGroup} />
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { contentBody, contentGroups } from '@/data/content'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { Receipt } from './Receipt'
import { PreviewArea } from './PreviewArea'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'

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
      if (!paragraph || !labelL || !labelR || !line || !receipt) return

      // 초기 상태 — (Content & Marketing) 만 visible (좌우 라벨 visible from start)
      // paragraph hidden, 선 scaleX 0, 영수증 maxHeight 0
      gsap.set(paragraph, { opacity: 0, y: 20 })
      gsap.set(line, { width: 0 })
      gsap.set(receipt, { maxHeight: 0 })

      // outer height 280vh = sticky 100vh + 진행 100vh + 자연 scroll 80vh
      // sticky 풀림 시점 = outer top -180vh (= timeline 0.64 시점, end 'top top+=280%' 기준)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: '+=180%',  // outer top 0 ~ -180vh = sticky 잡힌 동안 = timeline 진행 거리
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      // 0 ~ 0.1    선 width 0 → 60vw (라벨 *바로* 가운데 sticky 잡힘 + 선 자라남)
      tl.to(line, { width: '60vw', ease: 'power2.inOut' }, 0)
      // 0.1 ~ 0.2  paragraph fade-in
      tl.to(paragraph, { opacity: 1, y: 0, ease: 'power2.out' }, 0.1)
      // 0.2 ~ 0.5  영수증 maxHeight 0 → 48vh (sticky 잡힌 동안, 라벨 안 통과)
      tl.to(receipt, { maxHeight: '48vh', ease: 'power2.out' }, 0.2)
      // 0.5 ~ 1.0  sticky 잡힌 동안 영수증 *나머지 자라남* (48 → 90vh)
      //            sticky element overflow X 라 viewport 밖까지 자라난 후
      //            outer 끝까지 100vh 추가 진행 = sticky 풀림 + 화면 위로 이동 + 영수증 *전체 visible*
      tl.to(receipt, { maxHeight: '90vh', ease: 'power1.out' }, 0.5)

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
        style={{ height: '280vh' }}
      >
        <div className="sticky top-0 h-screen w-full px-side-m md:px-side-t xl:px-side-d">
          {/* paragraph — absolute 위쪽 고정 */}
          <p
            data-cm-paragraph
            className="absolute left-1/2 max-w-[720px] text-center font-kr text-body-l leading-relaxed text-ink-inverse/70"
            style={{
              top: '18vh',
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
            className="absolute left-0 right-0 flex items-center justify-center font-mono text-label uppercase tracking-[0.08em] text-ink-inverse/70"
            style={{
              top: '50vh',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <span data-cm-label-left>(Content&nbsp;</span>
            <div
              data-cm-line
              className="h-px bg-ink-inverse/30"
              style={{ width: 0 }}
            />
            <span data-cm-label-right>&nbsp;&amp; Marketing)</span>
          </div>

          {/* Receipt — absolute *라벨 바로 아래* + maxHeight 위→아래 자라남 (선에서 떨어짐). z-index 1 */}
          <div
            data-cm-receipt
            className="absolute left-1/2"
            style={{
              top: '52vh',
              transform: 'translateX(-50%)',
              maxHeight: 0,
              overflow: 'hidden',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div className="receipt-sway">
              <Receipt groups={contentGroups} variant="stage1" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── [2] Receipt compact (좌) + PreviewArea (우) ─── */}
      <div
        className="relative grid min-h-screen-dvh grid-cols-12 gap-gutter-d px-side-m py-[10vh] md:px-side-t xl:px-side-d"
        data-stage="2"
      >
        {/* 좌 — Receipt compact */}
        <div className="col-span-12 md:col-span-5 md:pr-6">
          <div className="sticky top-[12vh]">
            <Receipt
              groups={contentGroups}
              variant="stage2"
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>
        </div>

        {/* 우 — PreviewArea */}
        <div className="col-span-12 md:col-span-7 md:pl-6">
          <PreviewArea group={activeGroup} />
        </div>
      </div>
    </section>
  )
}

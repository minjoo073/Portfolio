'use client'

import { useState } from 'react'
import { contentBody, contentGroups } from '@/data/content'
import { SectionLabel } from '@/components/primitives/SectionLabel'
import { Receipt } from './Receipt'
import { PreviewArea } from './PreviewArea'

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

  return (
    <section
      id="content"
      className="relative bg-dark text-ink-inverse"
      data-section="content-marketing"
    >
      {/* ─── [0] 진입 단독 라벨 ─── */}
      <div className="flex h-screen-dvh items-center justify-center">
        <SectionLabel className="text-ink-inverse/70">Content &amp; Marketing</SectionLabel>
      </div>

      {/* ─── [1] 한글 + 분할 라벨 + 영수증 (large) ─── */}
      <div className="relative min-h-screen-dvh px-side-m py-[10vh] md:px-side-t xl:px-side-d">
        {/* 한글 paragraph — 상단 중앙 */}
        <p className="mx-auto max-w-[720px] text-center font-kr text-body-l leading-relaxed text-ink-inverse/70">
          {contentBody.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>

        {/* 분할 라벨 */}
        <div className="mt-[8vh] flex items-center gap-6 font-mono text-label uppercase tracking-[0.08em] text-ink-inverse/70">
          <span>(Content</span>
          <div className="h-px flex-1 bg-ink-inverse/30" />
          <span>&amp; Marketing)</span>
        </div>

        {/* Receipt large — 가운데 */}
        <div className="mt-[8vh] flex justify-center" data-stage="1">
          <Receipt groups={contentGroups} variant="stage1" />
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

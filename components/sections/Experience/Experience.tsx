'use client'

import { useEffect, useRef } from 'react'
import { experienceGroups } from '@/data/experience'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'

/**
 * Experience & Activities — About ↔ Web Projects 사이.
 *
 * 구조: 섹션 타이틀 → 카테고리별(라벨 + hairline) 3열 그리드.
 * 각 항목: 기간(mono) · 제목(테두리 선 박스 — 채움·글라스 X) · 세부 bullet.
 *
 * 등장 효과 (A+B):
 *  - 타이틀: 단어별 fade+rise 스태거 (overflow 마스크 X → 글자 잘림 방지)
 *  - 라벨/항목 스태거 페이드업
 *  - 카테고리 hairline 좌→우 그려짐(scaleX)
 *  - 제목 선 박스 테두리가 좌→우로 그려짐(clip-path wipe)
 *  - scroll-enter 1회, prefers-reduced-motion 폴백(정적)
 */
export function Experience() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // 정적 폴백

    registerGsap()
    const ctx = gsap.context(() => {
      const titleWords = root.querySelectorAll('[data-ex-title-word]')
      const hairlines = root.querySelectorAll('[data-ex-hairline]')
      const labels = root.querySelectorAll('[data-ex-label]')
      const items = root.querySelectorAll('[data-ex-item]')
      const boxes = root.querySelectorAll('[data-ex-box]')

      // 초기 상태 — 타이틀 단어 살짝 아래 + 투명 (overflow 마스크 X → 글자 잘림 없음)
      gsap.set(titleWords, { opacity: 0, y: 30 })
      gsap.set(labels, { opacity: 0, y: 10 })
      gsap.set(hairlines, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(items, { opacity: 0, y: 16 })
      gsap.set(boxes, { clipPath: 'inset(0 100% 0 0 round 0.5rem)' })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      })
      // 타이틀 단어 fade+rise — 차례로 떠오름 (속도 살짝 늦춤)
      tl.to(titleWords, { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.16 }, 0)
      tl.to(hairlines, { scaleX: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.16 }, 0.2)
      tl.to(labels, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.16 }, 0.28)
      tl.to(items, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, 0.42)
      tl.to(boxes, { clipPath: 'inset(0 0% 0 0 round 0.5rem)', duration: 0.78, ease: 'power3.inOut', stagger: 0.1 }, 0.52)

      gsap.delayedCall(0.3, () => ScrollTrigger.refresh())
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="experience"
      data-section="experience"
      className="relative z-20 bg-dark px-side-m pb-[12vh] pt-[24vh] text-ink-inverse md:px-side-t xl:px-side-d"
    >
      <div>
        {/* 섹션 타이틀 */}
        <h2
          data-ex-title
          className="font-display font-medium leading-[0.95] tracking-tight text-ink-inverse"
          style={{ fontSize: 'clamp(40px, 4.4vw, 72px)' }}
        >
          {['Experience', '&', 'Activities'].map((word, i, arr) => (
            <span
              key={i}
              data-ex-title-word
              className="inline-block"
              style={{ marginRight: i < arr.length - 1 ? '0.25em' : 0 }}
            >
              {word}
            </span>
          ))}
        </h2>

        {/* 카테고리 그룹 */}
        <div className="mt-[9vh] flex flex-col gap-[10vh]">
          {experienceGroups.map((group) => (
            <div key={group.category}>
              {/* 카테고리 라벨 + hairline */}
              <div className="flex items-center gap-5">
                <span
                  data-ex-label
                  className="font-mono font-medium uppercase tracking-[0.18em] text-accent"
                  style={{ fontSize: 'clamp(13px, 0.95vw, 15px)' }}
                >
                  {group.category}
                </span>
                <span data-ex-hairline className="h-px flex-1 bg-ink-inverse/15" aria-hidden />
              </div>

              {/* 3열 그리드 */}
              <div className="mt-9 grid grid-cols-1 gap-x-gutter-d gap-y-12 md:grid-cols-3">
                {group.items.map((item, i) => (
                  <div key={i} data-ex-item>
                    {/* 기간 */}
                    <span
                      className="block font-mono uppercase tracking-[0.1em] text-ink-inverse/45"
                      style={{ fontSize: 'clamp(10px, 0.6vw, 11px)', minHeight: '14px' }}
                    >
                      {item.period || ' '}
                    </span>

                    {/* 제목 — 테두리 선 박스 (채움·글라스 X) */}
                    <div
                      data-ex-box
                      className="mt-3 rounded-lg border border-ink-inverse/40 px-5 py-3.5 text-center font-kr font-medium text-ink-inverse transition-colors duration-300 hover:border-ink-inverse/70"
                      style={{ fontSize: 'clamp(15px, 1.2vw, 19px)', lineHeight: 1.4 }}
                    >
                      {item.title}
                    </div>

                    {/* 세부 설명 */}
                    {item.details.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-1.5">
                        {item.details.map((d, j) => (
                          <li
                            key={j}
                            className="font-kr text-ink-inverse/75"
                            style={{ fontSize: 'clamp(14px, 0.95vw, 16px)', lineHeight: 1.6 }}
                          >
                            {`- ${d}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

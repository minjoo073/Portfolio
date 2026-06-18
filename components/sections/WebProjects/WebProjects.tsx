'use client'

import { useRef } from 'react'
import { projects } from '@/data/projects'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { ProjectCard } from './ProjectCard'
import { registerGsap } from '@/lib/gsap/config'
import { DURATION, EASE, STAGGER, SCRUB } from '@/lib/gsap/tokens'
import gsap from 'gsap'

/**
 * Web Projects — 세로 풀블리드 스택 (Revision 2 as-built 정본).
 *
 * 구조 (docs/02_SectionStructure.md §3.1 1:1):
 *   60vh  — 라벨 구간
 *   N×70vh — 카드 N장 (데이터 배열 자동 확장)
 *   20vh  — 전환 여백
 *
 * 인터랙션 (docs/03_Interaction.md §4 1:1):
 *   - 섹션 라벨: y 15→0 · opacity 0→1 진입, scrub-loose 이탈
 *   - 카드 meta:  y 10→0 · opacity 0→1 · stagger item (card top 95%)
 *   - 카드 index: opacity 0→0.6 (card top 90%)
 *   - visual:     clip-path inset(100%→0) + scale 1.08→1 scrub (top 90%→50%)
 *   - title:      clip-path inset(0 100%→0) L→R · enter-soft (card top 75%)
 *   - exit parallax: visual y→-30 / title y→-20 · opacity→0.6 scrub
 *   - card hover: CSS group-hover (visual brightness, title translateX)
 *
 * Step 1 팩토리 재사용: registerGsap() → createReveal / createParallax 내부 사용.
 * ProgressBar 제거: 가로 트랙 전용 컴포넌트, 세로 맥락 부적합.
 * Visual Works(가로 핀)와 대비: Web = 세로 묵직, Visual = 가로 환기.
 */
export function WebProjects() {
  const rootRef = useRef<HTMLElement>(null)

  useGsapContext(
    () => {
      registerGsap()

      const root = rootRef.current
      if (!root) return

      // ── 카드별 애니메이션 ─────────────────────────────────────────
      const cards = root.querySelectorAll('[data-card]')

      cards.forEach((card) => {
        const meta = card.querySelector('[data-meta]')
        const indexEl = card.querySelector('[data-index]')
        const visualWrapper = card.querySelector('[data-visual-wrapper]')
        const visual = card.querySelector('[data-visual]')
        const titleEl = card.querySelector('[data-title]')

        // meta children: date · category stagger
        if (meta && meta.children.length > 0) {
          gsap.from(Array.from(meta.children), {
            y: 10,
            opacity: 0,
            stagger: STAGGER.item,
            duration: DURATION.enter,
            ease: EASE.enter,
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        // index: opacity 0 → 0.6
        if (indexEl) {
          gsap.from(indexEl, {
            opacity: 0,
            duration: DURATION.enter,
            ease: EASE.enter,
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        // visual 진입 — opacity 페이드(clip-path 폐기: 가장자리 AA seam 유발).
        // opacity 는 transform 과 다른 속성 → 호버 3D transform 과 충돌 없음.
        if (visual) {
          gsap.from(visual, {
            opacity: 0,
            duration: DURATION.enterSoft,
            ease: EASE.enter,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        // title: 가벼운 translateX + opacity reveal (transform 기반 → GPU 친화적)
        // ease 를 'sine.out' 로 → power3.out 의 첫 0.1s 빠른 opacity 상승이 "번쩍" 으로 인지되던 문제 완화
        // duration 더 길게 → 부드러운 진입
        if (titleEl) {
          gsap.from(titleEl, {
            x: -40,
            opacity: 0,
            duration: 1.4,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: titleEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }

        // exit parallax — visual y 0 → -30px (이전 카드가 위로 빠짐)
        if (visualWrapper) {
          gsap.to(visualWrapper, {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'bottom 50%',
              end: 'bottom top',
              scrub: SCRUB.loose,
              invalidateOnRefresh: true,
            },
          })
        }

        // exit parallax — title y 0 → -20px (opacity 변경 제거: 다음 카드 enter 와 시각 충돌 차단)
        if (titleEl) {
          gsap.to(titleEl, {
            y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'bottom 50%',
              end: 'bottom top',
              scrub: SCRUB.loose,
              invalidateOnRefresh: true,
            },
          })
        }
      })
    },
    rootRef,
    []
  )

  return (
    <section
      ref={rootRef}
      id="work"
      className="relative w-full bg-dark text-ink-inverse"
      data-section="web-projects"
    >
      {/* 섹션 전환(WorkIntro)이 About↔Web 사이를 책임짐(page.tsx). 여기선 카드 직행. */}

      {/* ── 카드 N × 70vh ─────────────────────────────────────────── */}
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} total={projects.length} />
      ))}

      {/* ── 전환 여백 20vh ────────────────────────────────────────── */}
      <div className="h-[20vh]" aria-hidden />
    </section>
  )
}

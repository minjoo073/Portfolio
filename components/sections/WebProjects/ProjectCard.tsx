'use client'

import { useRef } from 'react'
import type { Project } from '@/lib/types/project'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'

interface ProjectCardProps {
  project: Project
  total: number
}

/* 메타 한글화 — 큰 영문 타이틀 제외 나머지는 한글(CEO 2026-06-18). */
const MONTH: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
const CAT_KR: Record<string, string> = {
  Brand: '브랜드', Web: '웹', Redesign: '리디자인',
  'Front-end': '프론트엔드', 'Product Design': '프로덕트 디자인',
}
const krDate = (d: string) => {
  const [mon, year] = d.split(' ')
  return MONTH[mon] ? `${year}.${MONTH[mon]}` : d
}
const krCategory = (c: string) => {
  let r = c
  for (const [en, kr] of Object.entries(CAT_KR)) r = r.split(en).join(kr)
  return r
}

const EDGE_RING = 'inset 0 0 0 1px #0A0A0A' // 가장자리 1px 검정 — AA 번짐(흰 선) 덮기

/**
 * Web Project 카드 — 리디자인 v2 (CEO 2026-06-18, 재요청 반영).
 *
 * 좌측: 세로 중앙 정렬 "한 덩어리" — 인덱스 → 메타(한글) → 타이틀(영문) → 서브라인 →
 *       제작과정 보기(주) → 실사이트·깃허브·Cafe24(부). 위계·여백·nav 분리 해결.
 * 우측: overflow 프레임 제거된 3D 카드(커서 tilt + 떠오름). 흰 선 제거(willChange 제거,
 *       inset-0, 1px 검정 inset 링). 이미지 전체 클릭 → 제작과정.
 *
 * 충돌 방지: 진입=opacity([data-visual]) / 이탈 parallax=transform([data-visual-wrapper]) /
 *           호버=transform([data-visual]). 같은 요소에 GSAP transform 과 호버 transform 안 겹침.
 * GSAP 셀렉터: [data-card][data-meta][data-index][data-visual-wrapper][data-visual][data-title]
 */
export function ProjectCard({ project, total }: ProjectCardProps) {
  const isArchive = project.displayType === 'archive'
  const totalStr = String(total).padStart(2, '0')
  const reduced = useReducedMotionContext()
  const visualRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent) {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 16 // ±8°
    const rotX = -((e.clientY - rect.top) / rect.height - 0.5) * 16
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`
    el.style.boxShadow = `0 36px 90px -28px rgba(0,0,0,0.8), ${EDGE_RING}`
    el.style.filter = isArchive ? 'brightness(0.94)' : project.dimThumb ? 'brightness(0.95)' : 'brightness(1.05)'
  }
  function handleMouseLeave() {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = EDGE_RING
    el.style.filter = isArchive ? 'brightness(0.85)' : project.dimThumb ? 'brightness(0.9)' : ''
  }

  const visualInner = (
    <div
      ref={visualRef}
      className="absolute inset-0 bg-dark-soft transition-[transform,filter,box-shadow] duration-500 ease-out"
      style={{
        backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backfaceVisibility: 'hidden',
        boxShadow: EDGE_RING,
        filter: isArchive ? 'brightness(0.85)' : project.dimThumb ? 'brightness(0.9)' : undefined,
      }}
      data-visual
    />
  )

  return (
    <article
      className="relative h-[90vh] w-full"
      data-card
      data-project-id={project.id}
      data-display-type={project.displayType}
    >
      <div className="flex h-full w-full items-stretch">
        {/* ── 좌 42% 메타 패널 — 3존 분리(상단 메타 / 중앙 타이틀 앵커 / 하단 행동존) ── */}
        <div className="flex w-[42%] flex-col justify-between py-[14vh] px-side-m md:px-side-t xl:px-side-d">
          {/* Zone 1 — 메타 (상단, nav 와 간격) */}
          <div>
            <span
              className="block font-mono text-label tracking-[0.16em] text-ink-inverse/40"
              data-index
            >
              {project.index} / {totalStr}
            </span>
            <div
              className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-label text-ink-inverse/50"
              data-meta
            >
              <span className="font-mono tracking-[0.06em]">{krDate(project.date)}</span>
              <span className="text-ink-inverse/25">·</span>
              <span className="font-kr">{krCategory(project.category)}</span>
              <span className="text-ink-inverse/25">·</span>
              <span
                className={
                  'font-kr ' +
                  (project.workType === 'original' ? 'text-ink-inverse/90' : 'text-ink-inverse/45')
                }
              >
                {project.workType === 'original' ? '오리지널' : '리디자인'}
              </span>
            </div>
          </div>

          {/* Zone 2 — 타이틀 앵커 (중앙, 초점) */}
          <div>
            <h3
              className="font-display tracking-tight leading-[0.88] text-ink-inverse"
              style={{ fontSize: 'clamp(56px, 8vw, 112px)', fontWeight: 400 }}
              data-title
            >
              {project.title}
            </h3>
            <p className="mt-6 max-w-md font-kr text-[15px] leading-relaxed text-ink-inverse/55">
              {project.subline}
            </p>
          </div>

          {/* Zone 3 — 행동존 (하단, 구분선으로 분리) */}
          <div>
            <div className="mb-8 h-px w-14 bg-ink-inverse/15" aria-hidden />
            {project.studyHref ? (
              <a
                href={project.studyHref}
                className="group/case inline-flex w-fit items-center gap-4"
              >
                <span className="h-px w-8 bg-ink-inverse/70 transition-[width,background-color] duration-500 ease-out group-hover/case:w-16 group-hover/case:bg-ink-inverse" />
                <span className="font-kr text-[22px] tracking-tight text-ink-inverse">제작과정 보기</span>
                <span className="inline-block text-[18px] text-ink-inverse/70 transition-transform duration-300 group-hover/case:translate-x-1">
                  →
                </span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-4">
                <span className="h-px w-8 bg-ink-inverse/20" />
                <span className="font-kr text-[22px] text-ink-inverse/35">제작과정 준비중</span>
              </span>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-kr text-[15px]">
              {project.siteHref && <ExtLink href={project.siteHref}>실사이트</ExtLink>}
              {project.githubHref && <ExtLink href={project.githubHref}>깃허브</ExtLink>}
              {project.skinHref && <ExtLink href={project.skinHref}>Cafe24</ExtLink>}
            </div>
          </div>
        </div>

        {/* ── 우 58% 비주얼 — 3D 카드, 클릭 → 제작과정 ──────────────── */}
        <div className="flex w-[58%] items-center justify-end px-side-m md:px-side-t xl:px-side-d">
          <div
            className="relative w-full"
            style={{ aspectRatio: '16 / 9' }}
            data-visual-wrapper
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {project.studyHref ? (
              <a
                href={project.studyHref}
                aria-label={`${project.title} 제작과정 보기`}
                className="absolute inset-0 block"
              >
                {visualInner}
              </a>
            ) : (
              visualInner
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* 외부 링크 (실사이트·깃허브·Cafe24) — 작은 한 줄, muted, ↗ */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/ext inline-flex items-center gap-1.5 text-ink-inverse/55 transition-colors duration-300 hover:text-ink-inverse"
    >
      <span>{children}</span>
      <span className="inline-block text-[12px] transition-transform duration-300 group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5">
        ↗
      </span>
    </a>
  )
}

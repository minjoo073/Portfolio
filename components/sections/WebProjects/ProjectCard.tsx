'use client'

import { useRef } from 'react'
import type { Project } from '@/lib/types/project'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'

interface ProjectCardProps {
  project: Project
  total: number
}

/* ── 날짜 한국어 포맷 ──────────────────────────────────────────── */
const MONTH: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
const krDate = (d: string) => {
  const [mon, year] = d.split(' ')
  return MONTH[mon] ? `${year}.${MONTH[mon]}` : d
}

// EDGE_RING 제거 — 1px inset border 가 전체 이미지 색감 죽이는 원인 (CEO 2026-06-19)

/* ── vw 스케일 헬퍼 (base 1920) ─────────────────────────────────── */
// clamp(minPx, vwVal, maxPx) — 가독성 보호 + 1920 이상 캡
const vw = (basePx: number, minPx: number) =>
  `clamp(${minPx}px, ${((basePx / 1920) * 100).toFixed(4)}vw, ${basePx}px)`

/* ── Stack 칩 ───────────────────────────────────────────────────── */
function StackChip({ label }: { label: string }) {
  if (label === '—') return null
  return (
    <span
      className="inline-flex items-center font-kr font-medium uppercase tracking-[0.08em] text-ink-inverse/60"
      style={{
        fontSize: vw(11, 10),
        background: 'rgba(255,255,255,0.06)',
        paddingLeft: '12px',
        paddingRight: '12px',
        height: '24px',
        borderRadius: '4px',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </span>
  )
}

/* ── 외부 링크 (실사이트·깃허브) ──────────────────────────────── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/ext inline-flex items-center gap-1.5 transition-colors duration-300"
      style={{ fontSize: vw(15, 13), color: 'rgba(248,247,244,0.55)' }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,247,244,1)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,247,244,0.55)'
      }}
    >
      <span>{children}</span>
      <span className="inline-block text-[12px] transition-transform duration-300 group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5">
        ↗
      </span>
    </a>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HERO CARD — Bracket Ledger 그리드 (01–05)
   90vh, 일반 스크롤
   ═══════════════════════════════════════════════════════════════ */

/**
 * Hero 카드 레이아웃 (viewport-비례 vw 스케일링, base 1920):
 *
 * padding-x:  clamp(64px,  6.25vw,  120px)
 * left  (01·03·05): rail(7.29vw) gap1(3.125vw) body(25vw) gap2(2.604vw) visual(1fr)
 * right (02·04):    visual(1fr) gap2(2.604vw) body(25vw) gap1(3.125vw) rail(7.29vw)
 *
 * visual 트랙은 1fr — 스크롤바 거터 등 잔여공간 전부 흡수, 오버플로우 0 보장.
 * 비주얼 박스 자체는 maxWidth clamp(660px,45.83vw,880px) 캡.
 * justifySelf: left→end / right→start 로 본문 쪽에 붙어 호흡 여백 생성.
 */
function HeroCard({ project, total }: ProjectCardProps) {
  const reduced = useReducedMotionContext()
  const visualRef = useRef<HTMLDivElement>(null)

  const isRight = project.variant === 'right'
  const is4x5 = project.visualRatio === '4:5'
  const totalStr = String(total).padStart(2, '0')
  const wordmark = project.wordmark ?? project.title

  /* 비주얼 비율 — 컬럼 폭은 grid가 결정, aspect-ratio만 제어 */
  const visualAspectStr = is4x5 ? '760 / 950' : '16 / 10'

  /* 3D 호버 — data-visual 에만 transform */
  function handleMouseMove(e: React.MouseEvent) {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const rotX = -((e.clientY - rect.top) / rect.height - 0.5) * 12
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`
    el.style.boxShadow = '0 36px 90px -28px rgba(0,0,0,0.8)'
    el.style.filter = project.dimThumb ? 'brightness(0.95)' : 'brightness(1.04)'
  }
  function handleMouseLeave() {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
    el.style.filter = project.dimThumb ? 'brightness(0.9)' : ''
  }

  /* 역할·스택 — placeholder '—' 제거 */
  const roles = (project.role ?? []).filter(r => r !== '—')
  const stacks = (project.stack ?? []).filter(s => s !== '—')
  const roleStr = roles.length > 0 ? roles.join(' · ') : null
  const hasStacks = stacks.length > 0

  /* ── 비주얼 블록 ── */
  const visualBlock = (
    <div
      className="relative"
      style={{
        width: '100%',
        maxWidth: 'clamp(660px, 45.83vw, 880px)',
        aspectRatio: visualAspectStr,
        // 1fr 컬럼이 남는 공간을 모두 차지하므로 비주얼 박스를 본문 쪽에 붙임
        justifySelf: isRight ? 'start' : 'end',
      }}
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
          <div
            ref={visualRef}
            className="absolute inset-0 bg-dark-soft transition-[transform,filter,box-shadow] duration-500 ease-out"
            style={{
              backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backfaceVisibility: 'hidden',
              filter: project.dimThumb ? 'brightness(0.9)' : undefined,
            }}
            data-visual
          />
        </a>
      ) : (
        <div
          ref={visualRef}
          className="absolute inset-0 bg-dark-soft transition-[transform,filter,box-shadow] duration-500 ease-out"
          style={{
            backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backfaceVisibility: 'hidden',
            filter: project.dimThumb ? 'brightness(0.9)' : undefined,
          }}
          data-visual
        />
      )}
    </div>
  )

  /* ── 메타 레일 (세로 스택, 12px row-gap) ── */
  const metaRail = (
    <div
      className="flex flex-col"
      style={{ width: '100%', gap: '12px' }}
      data-meta
    >
      {/* 연월 */}
      <span
        className="font-mono text-ink-inverse/50"
        style={{ fontSize: vw(14, 12), lineHeight: 1.8, letterSpacing: '0.08em' }}
      >
        {krDate(project.date)}
      </span>
      {/* 카테고리 */}
      <span
        className="font-kr text-ink-inverse/50"
        style={{ fontSize: vw(14, 12), lineHeight: 1.8, letterSpacing: '0.08em' }}
      >
        {project.category}
      </span>
      {/* 오리지널 / 리디자인 */}
      <span
        className="font-kr"
        style={{
          fontSize: vw(14, 12),
          lineHeight: 1.8,
          letterSpacing: '0.08em',
          color: project.workType === 'original'
            ? 'rgba(248,247,244,0.9)'
            : 'rgba(248,247,244,0.5)',
        }}
      >
        {project.workType === 'original' ? '오리지널' : '리디자인'}
      </span>
      {/* 1인 / 팀 + 기여도 — 정직성 헌장 */}
      {project.scale && (
        <span
          className="font-kr"
          style={{
            fontSize: vw(14, 12),
            lineHeight: 1.8,
            letterSpacing: '0.08em',
            color: project.scale.includes('팀')
              ? 'rgba(248,247,244,0.7)'
              : 'rgba(248,247,244,0.5)',
          }}
        >
          {project.scale}
        </span>
      )}
      {/* 역할 레일용 축약 (역할 있을 때만) */}
      {roleStr && (
        <span
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(14, 12), lineHeight: 1.8, letterSpacing: '0.08em' }}
        >
          {roleStr}
        </span>
      )}
    </div>
  )

  /* ── 본문 컬럼 ── */
  const bodyCol = (
    <div className="relative flex flex-col" style={{ width: '100%' }}>

      {/* 회차 카운터 (우상단 — 본문 컬럼 내 우측 정렬) */}
      <div className="flex justify-end">
        {/* perspective wrapper — Index Flip (Option 5) */}
        <div style={{ perspective: '600px' }}>
          <span
            className="font-mono text-ink-inverse/40"
            style={{
              fontSize: vw(14, 12),
              letterSpacing: '0.16em',
              display: 'inline-block',
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 100%',
            }}
            data-index
          >
            {project.index} / {totalStr}
          </span>
        </div>
      </div>

      {/* 워드마크 */}
      <h3
        className="font-display text-ink-inverse"
        style={{
          fontSize: vw(112, 80),
          lineHeight: 0.88,
          letterSpacing: '-0.02em',
          fontWeight: 400,
          marginTop: vw(16, 12),
        }}
        data-title
      >
        {wordmark}
      </h3>

      {/* 한 줄 카피 */}
      {project.tagline && (
        <p
          className="font-kr text-ink-inverse/65"
          style={{ fontSize: vw(22, 17), letterSpacing: '-0.01em', fontWeight: 400, marginTop: vw(32, 24) }}
        >
          {project.tagline}
        </p>
      )}

      {/* 역할 */}
      {roleStr && (
        <p
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(16, 14), fontWeight: 400, marginTop: vw(24, 18) }}
        >
          {roleStr}
        </p>
      )}

      {/* 스택 칩 행 */}
      {hasStacks && (
        <div className="flex flex-wrap gap-2" style={{ marginTop: vw(24, 18) }}>
          {stacks.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}

      {/* CTA 영역 */}
      <div style={{ marginTop: vw(48, 36) }}>
        {/* CTA 주 — 제작과정 (내부 라우트) */}
        {project.studyHref ? (
          <a
            href={project.studyHref}
            className="group/case inline-flex w-fit items-center gap-4"
          >
            <span
              className="h-px bg-ink-inverse/70 transition-[width,background-color] duration-500 ease-out group-hover/case:bg-ink-inverse"
              style={{ width: vw(16, 12) }}
            />
            <span
              className="font-kr text-ink-inverse"
              style={{ fontSize: vw(22, 17) }}
            >
              제작과정
            </span>
            <span className="inline-block text-[18px] text-ink-inverse/70 transition-transform duration-300 group-hover/case:translate-x-1">
              →
            </span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-4">
            <span className="h-px w-8 bg-ink-inverse/20" />
            <span className="font-kr text-ink-inverse/35" style={{ fontSize: vw(22, 17) }}>제작과정 준비중</span>
          </span>
        )}

        {/* hairline 구분선 */}
        <div
          className="bg-ink-inverse/15"
          style={{ height: '1px', width: '100%', marginTop: vw(24, 18), marginBottom: vw(24, 18) }}
          aria-hidden
        />

        {/* CTA 부 — 실사이트 · 깃허브 */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.siteHref && <ExtLink href={project.siteHref}>실사이트</ExtLink>}
          {project.githubHref && <ExtLink href={project.githubHref}>깃허브</ExtLink>}
          {project.skinHref && <ExtLink href={project.skinHref}>카페24</ExtLink>}
        </div>
      </div>

    </div>
  )

  /*
   * CSS Grid column definitions (vw 기반, base 1920):
   *   left:  rail(7.29vw) gap1(4.17vw) body(30.73vw) gap2(3.13vw) visual(39.58vw)
   *   right: visual(39.58vw) gap2(3.13vw) body(30.73vw) gap1(4.17vw) rail(7.29vw)
   *
   * DOM 순서도 grid-template-columns 순서에 맞춰 분기.
   */
  const RAIL   = `clamp(105px, 7.29vw, 140px)`
  const GAP1   = `clamp(45px, 3.125vw, 60px)`
  const BODY   = `minmax(0, clamp(360px, 25vw, 480px))`
  const GAP2   = `clamp(38px, 2.604vw, 50px)`
  // 1fr — 남는 공간 전체를 차지. vw 계산식 대신 fail-safe.
  // 비주얼 박스 자체는 maxWidth clamp(660px,45.83vw,880px) 로 캡.
  const VISUAL = `minmax(0, 1fr)`

  const gridColsLeft  = `${RAIL} ${GAP1} ${BODY} ${GAP2} ${VISUAL}`
  const gridColsRight = `${VISUAL} ${GAP2} ${BODY} ${GAP1} ${RAIL}`

  return (
    <article
      className="relative w-full overflow-hidden"
      style={{ minHeight: '90vh' }}
      data-card
      data-project-id={project.id}
      data-display-type={project.displayType}
      data-variant={project.variant ?? 'left'}
    >
      <div
        className="py-[10vh]"
        style={{
          display: 'grid',
          gridTemplateColumns: isRight ? gridColsRight : gridColsLeft,
          alignItems: 'center',
          paddingLeft: vw(120, 64),
          paddingRight: vw(120, 64),
        }}
      >
        {isRight ? (
          /* ── right variant: [visual] [gap2] [body] [gap1] [rail] ── */
          <>
            {visualBlock}
            <div aria-hidden />
            {bodyCol}
            <div aria-hidden />
            {metaRail}
          </>
        ) : (
          /* ── left variant: [rail] [gap1] [body] [gap2] [visual] ── */
          <>
            {metaRail}
            <div aria-hidden />
            {bodyCol}
            <div aria-hidden />
            {visualBlock}
          </>
        )}
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ARCHIVE CARD — 내부 반쪽 카드 (06·07, ~60vh 공유 섹션 내부)
   ═══════════════════════════════════════════════════════════════ */
export function ArchiveCard({ project }: { project: Project }) {
  const reduced = useReducedMotionContext()
  const visualRef = useRef<HTMLDivElement>(null)

  /* 스택 — placeholder 제거 */
  const stacks = (project.stack ?? []).filter(s => s !== '—')
  const hasStacks = stacks.length > 0

  function handleMouseMove(e: React.MouseEvent) {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const rotX = -((e.clientY - rect.top) / rect.height - 0.5) * 12
    el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`
    el.style.boxShadow = '0 36px 90px -28px rgba(0,0,0,0.8)'
    el.style.filter = 'brightness(1.04)'
  }
  function handleMouseLeave() {
    if (reduced) return
    const el = visualRef.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
    el.style.filter = ''
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: '100%' }}
      data-archive-card
      data-project-id={project.id}
    >
      {/* 번호 + 연월·카테고리 — 이미지와 동일 폭 박스 안 좌측 정렬 */}
      <div
        className="w-full"
        style={{ maxWidth: 'clamp(380px, 34vw, 660px)' }}
      >
        <div className="flex items-baseline gap-3 mb-5" data-meta>
          <span
            className="font-mono text-ink-inverse/40"
            style={{ fontSize: '14px', letterSpacing: '0.16em' }}
          >
            {project.index}
          </span>
          <span
            className="font-kr text-ink-inverse/40"
            style={{ fontSize: '13px', letterSpacing: '0.04em' }}
          >
            {krDate(project.date)} · {project.category}
          </span>
        </div>
      </div>

      {/* 이미지 16:10 — Hero 와 동일 비율, overflow 없음 */}
      <div
        className="relative"
        style={{ aspectRatio: '16 / 10', width: '100%', maxWidth: 'clamp(380px, 34vw, 660px)' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={visualRef}
          className="absolute inset-0 bg-dark-soft transition-[transform,filter,box-shadow] duration-500 ease-out"
          style={{
            backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-visual
        />
      </div>

      {/* 타이틀 — Pretendard 28 (PP Editorial 삭제) */}
      <h3
        className="font-kr text-ink-inverse mt-5 text-center"
        style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.01em', maxWidth: 'clamp(380px, 34vw, 660px)', width: '100%' }}
        data-title
      >
        {project.title}
      </h3>

      {/* 한 줄 카피 */}
      {project.tagline && (
        <p
          className="font-kr text-ink-inverse/50 mt-2 text-center"
          style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: 'clamp(380px, 34vw, 660px)', width: '100%' }}
          data-meta
        >
          {project.tagline}
        </p>
      )}

      {/* 스택 칩 (옵션) */}
      {hasStacks && (
        <div className="flex flex-wrap justify-center gap-2 mt-4" style={{ maxWidth: 'clamp(380px, 34vw, 660px)', width: '100%' }} data-meta>
          {stacks.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 mt-5" style={{ maxWidth: 'clamp(380px, 34vw, 660px)', width: '100%' }} data-meta>
        {project.siteHref && <ExtLink href={project.siteHref}>실사이트</ExtLink>}
        {project.githubHref && <ExtLink href={project.githubHref}>깃허브</ExtLink>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC EXPORT — 라우터: hero / archive 분기
   ═══════════════════════════════════════════════════════════════ */
export function ProjectCard({ project, total }: ProjectCardProps) {
  if (project.displayType === 'archive') {
    // archive 카드는 WebProjects.tsx 에서 ArchiveCard 로 직접 렌더
    // 이 분기는 혹시 단독 사용 시 폴백
    return <ArchiveCard project={project} />
  }
  return <HeroCard project={project} total={total} />
}

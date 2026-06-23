'use client'

/**
 * HeroStickyExchange — Set 3 · Sticky Visual Exchange
 *
 * 패턴:
 *   - 단일 tall 컨테이너 (5 × 100vh = 500vh) 가 자연 스크롤 높이를 점유
 *   - 내부 sticky wrapper (CSS `position: sticky; top: 0; height: 100vh`) 가 뷰포트에 고정
 *   - step 마커 div 가 각 카드의 논리적 스크롤 구간을 나타냄 (tall 컨테이너 내부, normal flow)
 *   - 마커 top 이 vp 50% 통과 시 → onEnter/onEnterBack 으로 해당 카드 step animation (scrub X)
 *   - 스크롤 조금 해도 50% 안 넘으면 현재 카드 그대로 유지
 *
 * Lenis 안전:
 *   - GSAP pin 사용 안 함 → CSS sticky 만 사용 (Lenis 와 충돌 없음)
 *   - scrub 없음 → onEnter/onEnterBack 으로 즉시 step 전환 (0.5s 애니메이션)
 *   - invalidateOnRefresh: true 전역 defaults 에 이미 설정됨
 *
 * 그리드 (HeroCard 동일):
 *   left:  rail(7.29vw) gap1(3.125vw) body(25vw) gap2(2.604vw) visual(1fr)
 *   right: visual(1fr) gap2(2.604vw) body(25vw) gap1(3.125vw) rail(7.29vw)
 *   *단, Set 3 에서 variant(좌/우 교대)는 무시하고 항상 좌본문/우비주얼 고정*
 *   → 비주얼이 핀 고정 상태에서 좌우가 바뀌면 레이아웃 점프 발생
 *   → CEO 브리핑 "비주얼 컬럼 pin + 본문만 스윕" 패턴상 단일 컬럼 고정이 정답
 */

import { useRef, useState } from 'react'
import type { Project } from '@/lib/types/project'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useLenis } from '@/lib/hooks/useLenis'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ── 상수 ────────────────────────────────────────────────────────── */
// EDGE_RING 제거 — 1px inset border 가 전체 이미지 색감 죽이는 원인 (CEO 2026-06-19)

/* ── vw 스케일 헬퍼 (base 1920) ─────────────────────────────────── */
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

/* ── module-level cache for postNav slug (StrictMode double-mount 대응) ─ */
let _consumedSlug: string | null = null
let _consumedSlugAt = 0

/* ── 외부 링크 ──────────────────────────────────────────────────── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/ext inline-flex items-center gap-1.5 transition-colors duration-300"
      style={{ fontSize: vw(17, 15), color: 'rgba(248,247,244,0.55)' }}
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

/* ── 날짜 포맷 ──────────────────────────────────────────────────── */
const MONTH: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
const krDate = (d: string) => {
  const [mon, year] = d.split(' ')
  return MONTH[mon] ? `${year}.${MONTH[mon]}` : d
}

/* ── 그리드 컬럼 토큰 ──────────────────────────────────────────── */
// 1920 base: 48 + 130 + 40 + 420 + 40 + 1180 + 48 = 1906 (여유 14px)
// 1440 base: 40 + 105 + 28 + 340 + 28 + 800 + 40 = 1381 (여유 59px)
const RAIL   = `clamp(105px, 6.77vw, 130px)`
const GAP1   = `clamp(28px, 2.08vw, 40px)`
const BODY   = `minmax(0, clamp(340px, 21.875vw, 420px))`
const GAP2   = `clamp(28px, 2.08vw, 40px)`
const VISUAL = `minmax(0, 1fr)`
// 항상 좌본문/우비주얼 (Set 3 핀 레이아웃 고정)
const GRID_COLS = `${RAIL} ${GAP1} ${BODY} ${GAP2} ${VISUAL}`

/* ══════════════════════════════════════════════════════════════════
   비주얼 패널 — 5개가 absolute 로 겹쳐 쌓임
   ══════════════════════════════════════════════════════════════════ */
interface VisualPanelProps {
  project: Project
  index: number
}

function VisualPanel({ project, index }: VisualPanelProps) {
  const is4x5 = project.visualRatio === '4:5'
  const visualAspectStr = is4x5 ? '760 / 950' : '16 / 10'

  const inner = (
    <div
      className="absolute inset-0 bg-dark-soft"
      style={{
        backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: project.dimThumb ? 'brightness(0.9)' : undefined,
      }}
      data-visual-img
    />
  )

  return (
    <div
      className="absolute inset-0 flex items-center"
      style={{
        opacity: index === 0 ? 1 : 0,
        transform: index === 0 ? undefined : 'scale(1.04)',
        // 비활성 카드 클릭 차단 — 5개 겹쳐있어 맨 위 카드 a 태그가 클릭 가로채는 문제 방지
        pointerEvents: index === 0 ? 'auto' : 'none',
      }}
      data-visual-panel
      data-panel-index={index}
    >
      {/* 비주얼 박스 — HeroCard 동일 maxWidth + aspectRatio */}
      <div
        className="relative"
        style={{
          width: '100%',
          maxWidth: 'clamp(800px, 61.46vw, 1180px)',
          aspectRatio: visualAspectStr,
          justifySelf: 'end',
        }}
      >
        {project.studyHref ? (
          <a
            href={project.studyHref}
            aria-label={`${project.title} 제작과정 보기`}
            className="absolute inset-0 block"
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   본문 패널 — 5개가 absolute 로 겹쳐 쌓임, y 슬라이드
   ══════════════════════════════════════════════════════════════════ */
interface BodyPanelProps {
  project: Project
  index: number
  total: number
}

function BodyPanel({ project, index, total }: BodyPanelProps) {
  const totalStr = String(total).padStart(2, '0')
  const wordmark = project.wordmark ?? project.title
  const roles = (project.role ?? []).filter(r => r !== '—')
  const stacks = (project.stack ?? []).filter(s => s !== '—')
  const roleStr = roles.length > 0 ? roles.join(' · ') : null
  const hasStacks = stacks.length > 0

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        opacity: index === 0 ? 1 : 0,
        transform: index === 0 ? 'translateY(0)' : 'translateY(20px)',
        willChange: 'opacity, transform',
        pointerEvents: index === 0 ? 'auto' : 'none',
      }}
      data-body-panel
      data-panel-index={index}
    >
      {/* 회차 카운터 */}
      <div className="flex justify-end" style={{ marginBottom: vw(8, 6) }}>
        <div style={{ perspective: '600px' }}>
          <span
            className="font-mono text-ink-inverse/40"
            style={{
              fontSize: vw(13, 11),
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
          fontSize: vw(96, 64),
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
          className="font-kr text-ink-inverse/82 break-keep"
          style={{ fontSize: vw(26, 16), letterSpacing: '-0.01em', fontWeight: 400, marginTop: vw(32, 24) }}
        >
          {project.tagline}
        </p>
      )}

      {/* 역할 */}
      {roleStr && (
        <p
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(14, 12), fontWeight: 400, marginTop: vw(28, 22) }}
        >
          {roleStr}
        </p>
      )}

      {/* 스택 칩 */}
      {hasStacks && (
        <div className="flex flex-wrap gap-2" style={{ marginTop: vw(28, 22) }}>
          {stacks.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: vw(40, 32) }}>
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
              style={{ fontSize: vw(22, 18) }}
            >
              제작과정
            </span>
            <span className="inline-block text-[16px] text-ink-inverse/70 transition-transform duration-300 group-hover/case:translate-x-1">
              →
            </span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-4">
            <span className="h-px w-8 bg-ink-inverse/20" />
            <span className="font-kr text-ink-inverse/35" style={{ fontSize: vw(22, 18) }}>제작과정 준비중</span>
          </span>
        )}

        <div
          className="bg-ink-inverse/15"
          style={{ height: '1px', width: '100%', marginTop: vw(28, 22), marginBottom: vw(28, 22) }}
          aria-hidden
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.siteHref && <ExtLink href={project.siteHref}>실사이트</ExtLink>}
          {project.githubHref && <ExtLink href={project.githubHref}>깃허브</ExtLink>}
          {project.skinHref && <ExtLink href={project.skinHref}>카페24</ExtLink>}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   메타 레일 패널 — 5개가 absolute 로 겹쳐 쌓임, y 슬라이드
   ══════════════════════════════════════════════════════════════════ */
interface MetaRailPanelProps {
  project: Project
  index: number
}

function MetaRailPanel({ project, index }: MetaRailPanelProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        opacity: index === 0 ? 1 : 0,
        transform: index === 0 ? 'translateY(0)' : 'translateY(20px)',
        willChange: 'opacity, transform',
      }}
      data-meta-panel
      data-panel-index={index}
    >
      <div className="flex flex-col" style={{ width: '100%', gap: '12px' }}>
        {/* 연월 */}
        <span
          className="font-mono text-ink-inverse/50"
          style={{ fontSize: vw(13, 11), lineHeight: 1.8, letterSpacing: '0.08em' }}
        >
          {krDate(project.date)}
        </span>
        {/* 카테고리 */}
        <span
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(13, 11), lineHeight: 1.8, letterSpacing: '0.08em' }}
        >
          {project.category}
        </span>
        {/* '리디자인' 만 표시 (밝게 강조) — '오리지널' 은 라인 자체 생략 */}
        {project.workType === 'redesign' && (
          <span
            className="font-kr"
            style={{
              fontSize: vw(15, 13),
              lineHeight: 1.8,
              letterSpacing: '0.08em',
              color: 'rgba(248,247,244,0.9)',
            }}
          >
            리디자인
          </span>
        )}
        {/* scale: 1인 제작 (밝게) / 팀 프로젝트 · 기여 X% (일반 톤) */}
        {project.scale && (
          <span
            className="font-kr"
            style={{
              fontSize: vw(15, 13),
              lineHeight: 1.8,
              letterSpacing: '0.08em',
              color: project.scale.includes('팀')
                ? 'rgba(248,247,244,0.5)'
                : 'rgba(248,247,244,0.9)',
            }}
          >
            {project.scale}
          </span>
        )}
        {/* role 은 본문(BodyPanel) 과 중복이므로 메타에서 제외 */}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   모바일 카드 — 펼친 그리드 대신 세로 스택 (핵심만: 비주얼+타이틀+카피+CTA)
   ══════════════════════════════════════════════════════════════════ */
function MobileFeaturedCard({ project, total }: { project: Project; total: number }) {
  const totalStr = String(total).padStart(2, '0')
  const wordmark = project.wordmark ?? project.title
  const is4x5 = project.visualRatio === '4:5'
  const aspect = is4x5 ? '760 / 950' : '16 / 10'
  const studySlug = project.studyHref?.match(/^\/work\/([\w-]+)/)?.[1]

  const visual = (
    <div className="relative w-full" style={{ aspectRatio: aspect }}>
      <div
        className="absolute inset-0 bg-dark-soft"
        style={{
          backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: project.dimThumb ? 'brightness(0.9)' : undefined,
        }}
      />
    </div>
  )

  return (
    <article
      id={studySlug ? `work-${studySlug}` : undefined}
      style={{
        paddingInline: 'clamp(20px, 5vw, 32px)',
        paddingBlock: 'clamp(48px, 9vh, 72px)',
      }}
      data-project-id={project.id}
    >
      {/* 회차 */}
      <span
        className="font-mono text-ink-inverse/40"
        style={{ fontSize: '12px', letterSpacing: '0.16em' }}
      >
        {project.index} / {totalStr}
      </span>

      {/* 워드마크 */}
      <h3
        className="font-display text-ink-inverse"
        style={{
          fontSize: 'clamp(46px, 13vw, 76px)',
          lineHeight: 0.9,
          letterSpacing: '-0.02em',
          fontWeight: 400,
          marginTop: '12px',
        }}
      >
        {wordmark}
      </h3>

      {/* 연월 · 카테고리 (· scale) */}
      <p
        className="font-kr text-ink-inverse/45"
        style={{ fontSize: '13px', letterSpacing: '0.04em', marginTop: '12px' }}
      >
        {krDate(project.date)} · {project.category}
        {project.scale ? ` · ${project.scale}` : ''}
      </p>

      {/* 비주얼 */}
      <div style={{ marginTop: 'clamp(24px, 6vw, 32px)' }}>
        {project.studyHref ? (
          <a href={project.studyHref} aria-label={`${project.title} 제작과정 보기`} className="block">
            {visual}
          </a>
        ) : (
          visual
        )}
      </div>

      {/* 한 줄 카피 */}
      {project.tagline && (
        <p
          className="font-kr text-ink-inverse/82 break-keep"
          style={{ fontSize: 'clamp(16px, 4.4vw, 19px)', lineHeight: 1.5, marginTop: 'clamp(20px, 5vw, 28px)' }}
        >
          {project.tagline}
        </p>
      )}

      {/* CTA — 제작과정 + 보조 링크 (스택 칩은 모바일에서 생략) */}
      <div style={{ marginTop: 'clamp(24px, 6vw, 32px)' }}>
        {project.studyHref ? (
          <a href={project.studyHref} className="inline-flex w-fit items-center gap-3">
            <span className="h-px w-4 bg-ink-inverse/70" />
            <span className="font-kr text-ink-inverse" style={{ fontSize: '18px' }}>제작과정</span>
            <span className="text-[16px] text-ink-inverse/70">→</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-ink-inverse/20" />
            <span className="font-kr text-ink-inverse/35" style={{ fontSize: '18px' }}>제작과정 준비중</span>
          </span>
        )}

        <div className="bg-ink-inverse/15" style={{ height: '1px', width: '100%', margin: '20px 0' }} aria-hidden />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.siteHref && <ExtLink href={project.siteHref}>실사이트</ExtLink>}
          {project.githubHref && <ExtLink href={project.githubHref}>깃허브</ExtLink>}
          {project.skinHref && <ExtLink href={project.skinHref}>카페24</ExtLink>}
        </div>
      </div>
    </article>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HeroStickyExchange — 메인 컴포넌트
   ══════════════════════════════════════════════════════════════════ */
interface HeroStickyExchangeProps {
  projects: Project[]
  total: number
}

export function HeroStickyExchange({ projects, total }: HeroStickyExchangeProps) {
  const reduced = useReducedMotionContext()
  const isMobile = useIsMobile()
  const sectionRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  // Lenis 인스턴스를 ref 에 보관 — wheel 핸들러 클로저에서 최신값 접근
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  // ── postNav 카드 복귀 — sessionStorage 의 slug 로 초기 활성 카드 결정 ──
  // useState initializer 안에서 즉시 읽음 (mount 첫 render). useEffect 시점에 다른 useEffect 가
  // remove 했을 가능성 회피.
  const [initialIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    try {
      const current = sessionStorage.getItem('postNavCardSlug')
      let slug: string | null = null
      if (current) {
        // 첫 mount — sessionStorage 즉시 consume + module cache 저장
        slug = current
        _consumedSlug = current
        _consumedSlugAt = Date.now()
        sessionStorage.removeItem('postNavCardSlug')
      } else if (_consumedSlug && Date.now() - _consumedSlugAt < 3000) {
        // StrictMode 두 번째 mount — sessionStorage 비어있지만 3초 내 cache 유효
        slug = _consumedSlug
      }
      if (!slug) return 0
      const found = projects.findIndex(
        p => (p.studyHref ?? '').replace(/\/$/, '') === `/work/${slug}`
      )
      return found >= 0 ? found : 0
    } catch {
      return 0
    }
  })

  useGsapContext(
    () => {
      registerGsap()

      const section = sectionRef.current
      if (!section) return

      // ── reduced-motion: wheel 핸들러 없이 자연 스크롤 ──────
      if (reduced) return
      if (isMobile) return // 모바일: 세로 스택 렌더 → sticky/그리드/wheel 미사용

      const count = projects.length
      if (count < 2) return

      // ── 패널 요소 수집 ────────────────────────────────────────
      const visualPanels = Array.from(section.querySelectorAll<HTMLElement>('[data-visual-panel]'))
      const bodyPanels   = Array.from(section.querySelectorAll<HTMLElement>('[data-body-panel]'))
      const metaPanels   = Array.from(section.querySelectorAll<HTMLElement>('[data-meta-panel]'))

      if (visualPanels.length !== count || bodyPanels.length !== count) return

      // ── 초기 상태 강제 설정 — initialIndex 활성 (useState 값), 나머지 hidden ───
      visualPanels.forEach((el, i) =>
        gsap.set(el, {
          opacity: i === initialIndex ? 1 : 0,
          scale: i === initialIndex ? 1 : 1.04,
          pointerEvents: i === initialIndex ? 'auto' : 'none',
        })
      )
      bodyPanels.forEach((el, i) =>
        gsap.set(el, {
          y: i === initialIndex ? 0 : 20,
          opacity: i === initialIndex ? 1 : 0,
          pointerEvents: i === initialIndex ? 'auto' : 'none',
        })
      )
      metaPanels.forEach((el, i) =>
        gsap.set(el, { y: i === initialIndex ? 0 : 20, opacity: i === initialIndex ? 1 : 0 })
      )

      // ── step animation 팩토리 ─────────────────────────────────
      // activeIndex 카드를 활성화하는 paused timeline 생성
      // 매번 새 timeline 을 만들어 play(0) 으로 즉시 실행
      const buildStepTl = (activeIndex: number) => {
        const tl = gsap.timeline({
          paused: true,
          // 시작 시점에 비활성 카드들을 즉시 op 0 으로 reset
          // 활성 카드 + 직전 활성 카드 외 다른 카드의 잔상 완전 차단
          onStart: () => {
            visualPanels.forEach((vis, i) => {
              if (i === activeIndex) return
              // 직전 활성 카드는 fade-out 트윈이 처리하니 skip
              // 그 외 카드는 즉시 hidden 상태 강제
              const opacity = parseFloat(getComputedStyle(vis).opacity)
              if (opacity > 0.01 && i !== prevActive) {
                gsap.set(vis, { opacity: 0, scale: 1.04 })
              }
            })
            bodyPanels.forEach((body, i) => {
              if (i === activeIndex) return
              const opacity = parseFloat(getComputedStyle(body).opacity)
              if (opacity > 0.01 && i !== prevActive) {
                gsap.set(body, { y: i < activeIndex ? -20 : 20, opacity: 0 })
              }
            })
            metaPanels.forEach((meta, i) => {
              if (i === activeIndex) return
              const opacity = parseFloat(getComputedStyle(meta).opacity)
              if (opacity > 0.01 && i !== prevActive) {
                gsap.set(meta, { y: i < activeIndex ? -20 : 20, opacity: 0 })
              }
            })
          }
        })

        // pointer-events 즉시 토글 — 활성 카드만 클릭 받게 (멀티 카드 a 태그 충돌 방지)
        visualPanels.forEach((vis, i) => {
          gsap.set(vis, { pointerEvents: i === activeIndex ? 'auto' : 'none' })
        })
        bodyPanels.forEach((body, i) => {
          gsap.set(body, { pointerEvents: i === activeIndex ? 'auto' : 'none' })
        })

        // overwrite: 'auto' — 같은 element 의 진행 중 트윈을 자동 kill (잔상 방지)
        visualPanels.forEach((vis, i) => {
          if (i === activeIndex) {
            tl.to(vis, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          } else {
            tl.to(vis, { opacity: 0, scale: 1.04, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          }
        })

        bodyPanels.forEach((body, i) => {
          if (i === activeIndex) {
            tl.to(body, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          } else if (i < activeIndex) {
            tl.to(body, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          } else {
            tl.to(body, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          }
        })

        metaPanels.forEach((meta, i) => {
          if (i === activeIndex) {
            tl.to(meta, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          } else if (i < activeIndex) {
            tl.to(meta, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          } else {
            tl.to(meta, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' }, 0)
          }
        })

        return tl
      }

      // 직전 활성 인덱스 추적 — 잔상 방지용 reset 로직에서 사용
      let prevActive = 0

      // step timeline 은 *매번* 새로 생성 — 캐시 안 함
      // 캐시 + play(0) 패턴은 GSAP 가 첫 호출 시 element 상태를 initial 로 기록 →
      // 이후 호출 시 stale initial 로 jump 발생 (02→03 잔상 원인)

      // ── ScrollTrigger: section 상단 오프셋 추적 전용 ──────────
      // onUpdate 로 currentActive 를 변경하지 않음
      // sectionTop 만 refresh 때마다 갱신하기 위해 사용
      let sectionTop = section.getBoundingClientRect().top + window.scrollY
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          sectionTop = self.start  // px 단위 스크롤 절댓값
        },
        // sticky 잡힌 동안만 Lenis wheel 처리 차단 — 진입/이탈 시 Lenis smooth 정상
        onEnter: () => section.setAttribute('data-lenis-prevent', ''),
        onLeave: () => section.removeAttribute('data-lenis-prevent'),
        onEnterBack: () => section.setAttribute('data-lenis-prevent', ''),
        onLeaveBack: () => section.removeAttribute('data-lenis-prevent'),
      })

      // ── Wheel 기반 단방향 1칸 이동 ────────────────────────────
      // Cooldown: 한 번 이동 후 COOLDOWN_MS 동안 추가 wheel 무시
      const COOLDOWN_MS = 900
      const MIN_DELTA   = 5   // 미세 진동 필터링

      let currentActive = initialIndex
      let cooldown      = false

      // sticky 구간 체크 — section tall 컨테이너가 viewport 를 점유 중인지
      // (= sticky wrapper 가 실제로 고정 상태인지)
      const isPinActive = () => {
        const rect = section.getBoundingClientRect()
        // top ≤ 0 이고 bottom ≥ innerHeight → sticky 잡힌 상태
        return rect.top <= 1 && rect.bottom >= window.innerHeight - 1
      }

      const goTo = (nextIndex: number) => {
        prevActive = currentActive
        currentActive = nextIndex
        // 매번 새 timeline — 현재 element state 부터 정확하게 트윈
        buildStepTl(nextIndex).play()

        // section 내 해당 슬롯 스크롤 위치로 이동
        // 슬롯 0 = sectionTop, 슬롯 1 = sectionTop + 1vh, ...
        const targetY = sectionTop + nextIndex * window.innerHeight
        const currentLenis = lenisRef.current
        if (currentLenis) {
          currentLenis.scrollTo(targetY, {
            duration: 0.85,
            easing: (t: number) => 1 - Math.pow(1 - t, 3), // ease-out-cubic
            lock: false,
            force: true,
          })
        } else {
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }

      const handleWheel = (e: WheelEvent) => {
        const delta = e.deltaY

        // 정방향 스크롤 (down)
        if (delta > MIN_DELTA) {
          if (!isPinActive()) return  // sticky 구간 밖이면 자유 스크롤

          // 05(마지막) 도달 후 wheel down → Lenis 로 부드러운 Archive 진입
          if (currentActive >= count - 1) {
            e.preventDefault()
            if (cooldown) return
            cooldown = true
            const sectionBottom = sectionTop + section.offsetHeight
            // 경계 전환: Lenis 멈춘 뒤 강제 스크롤 → 휠 관성 잔류로 튕기는 현상 방지
            lenisRef.current?.stop()
            lenisRef.current?.scrollTo(sectionBottom + 1, {
              duration: 0.6, lock: false, force: true,
            })
            setTimeout(() => {
              cooldown = false
              lenisRef.current?.start()
            }, COOLDOWN_MS)
            return
          }

          e.preventDefault()
          if (cooldown) return

          cooldown = true
          goTo(currentActive + 1)
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
          return
        }

        // 역방향 스크롤 (up)
        if (delta < -MIN_DELTA) {
          if (!isPinActive()) return  // sticky 구간 밖이면 자유 스크롤

          // 01(첫 번째) 도달 후 wheel up → Lenis 로 부드러운 위쪽(About) 진입
          if (currentActive <= 0) {
            e.preventDefault()
            if (cooldown) return
            cooldown = true
            // 경계 전환: Lenis 멈춘 뒤 강제 스크롤 → 휠 관성 잔류로 튕기는 현상 방지
            lenisRef.current?.stop()
            lenisRef.current?.scrollTo(sectionTop - window.innerHeight, {
              duration: 0.6, lock: false, force: true,
            })
            setTimeout(() => {
              cooldown = false
              lenisRef.current?.start()
            }, COOLDOWN_MS)
            return
          }

          e.preventDefault()
          if (cooldown) return

          cooldown = true
          goTo(currentActive - 1)
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        }
      }

      // ── 터치 이벤트 (모바일) ──────────────────────────────────
      const TOUCH_THRESHOLD = 50  // px
      let touchStartY = 0

      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0]?.clientY ?? 0
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!isPinActive()) return
        const deltaY = touchStartY - (e.touches[0]?.clientY ?? 0)

        if (Math.abs(deltaY) < TOUCH_THRESHOLD) return

        if (deltaY > 0 && currentActive < count - 1) {
          e.preventDefault()
          if (cooldown) return
          cooldown = true
          goTo(currentActive + 1)
          touchStartY = e.touches[0]?.clientY ?? 0
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        } else if (deltaY < 0 && currentActive > 0) {
          e.preventDefault()
          if (cooldown) return
          cooldown = true
          goTo(currentActive - 1)
          touchStartY = e.touches[0]?.clientY ?? 0
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        }
      }

      // passive: false — e.preventDefault() 를 wheel 내부에서 호출하기 위해 필요
      section.addEventListener('wheel', handleWheel, { passive: false })
      section.addEventListener('touchstart', handleTouchStart, { passive: true })
      section.addEventListener('touchmove', handleTouchMove, { passive: false })

      // ── Lenis 안전 refresh ────────────────────────────────────
      gsap.delayedCall(0.15, () => {
        ScrollTrigger.refresh?.()
        // refresh 후 sectionTop 재계산
        sectionTop = section.getBoundingClientRect().top + window.scrollY
      })

      // ── cleanup ───────────────────────────────────────────────
      // useGsapContext 는 ctx.revert() 만 자동 실행하므로
      // wheel/touch 리스너는 직접 제거
      return () => {
        section.removeEventListener('wheel', handleWheel)
        section.removeEventListener('touchstart', handleTouchStart)
        section.removeEventListener('touchmove', handleTouchMove)
        st.kill()
      }
    },
    sectionRef,
    [isMobile] // isMobile 확정 시 재실행(모바일 가드)
  )

  /* ── 모바일: 세로 스택 (sticky/그리드/wheel 없이 자연 스크롤) ───────────── */
  if (isMobile) {
    return (
      <div data-hero-sticky-section>
        {projects.map((project, i) => (
          <div key={project.id}>
            <MobileFeaturedCard project={project} total={total} />
            {i < projects.length - 1 && (
              <div
                aria-hidden
                style={{
                  height: '1px',
                  margin: '0 clamp(20px, 5vw, 32px)',
                  background: 'rgba(248,247,244,0.10)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    /*
     * tall 컨테이너 — 자연 스크롤 높이를 제공 (count × 100vh)
     * position: relative 는 sticky 자식과 step 마커의 offset 기준점
     */
    <div
      ref={sectionRef}
      style={{ height: `${projects.length * 100}vh`, position: 'relative' }}
      data-hero-sticky-section
    >
      {/*
       * sticky wrapper — 뷰포트에 고정 (CSS sticky, GSAP pin 아님)
       * height: 100vh 로 뷰포트 채우기
       */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1,
        }}
        data-hero-sticky-wrapper
      >
        {/*
         * 그리드 레이아웃 — HeroCard 와 동일한 5-column 그리드
         * [rail] [gap1] [body] [gap2] [visual]
         * 항상 좌본문/우비주얼 고정 (Set 3 핀 레이아웃)
         */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLS,
            alignItems: 'stretch',
            height: '100%',
            paddingLeft: vw(48, 40),
            paddingRight: vw(48, 40),
            paddingTop: '5vh',
            paddingBottom: '5vh',
          }}
        >
          {/* ── 메타 레일 컬럼 (col 1) ── */}
          <div className="relative" style={{ overflow: 'hidden' }}>
            {projects.map((project, i) => (
              <MetaRailPanel key={project.id} project={project} index={i} />
            ))}
          </div>

          {/* ── gap1 (col 2) ── */}
          <div aria-hidden />

          {/* ── 본문 컬럼 (col 3) ── */}
          <div className="relative" style={{ overflow: 'hidden' }}>
            {projects.map((project, i) => (
              <BodyPanel
                key={project.id}
                project={project}
                index={i}
                total={total}
              />
            ))}
          </div>

          {/* ── gap2 (col 4) ── */}
          <div aria-hidden />

          {/* ── 비주얼 컬럼 (col 5) ── */}
          <div className="relative flex items-center" style={{ overflow: 'hidden' }}>
            {projects.map((project, i) => (
              <VisualPanel key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/*
       * step 마커 — 각 카드의 논리적 스크롤 구간 (normal flow)
       * sticky wrapper 바깥에서 tall 컨테이너 기준 absolute 배치
       * pointerEvents: none → 클릭/hover 이벤트 투과
       * zIndex: 0 → sticky wrapper(zIndex:1) 뒤에 위치
       */}
      {projects.map((project, i) => {
        // studyHref `/work/<slug>` 에서 slug 추출 → step marker 에 id 부여
        // WorkViewer Back 클릭 시 `work-<slug>` 로 정확한 카드 위치 복귀
        const studySlug = project.studyHref?.match(/^\/work\/([\w-]+)/)?.[1]
        return (
          <div
            key={i}
            data-step-marker
            data-step={i}
            id={studySlug ? `work-${studySlug}` : undefined}
            style={{
              position: 'absolute',
              top: `${i * 100}vh`,
              height: '100vh',
              width: '1px',
              left: 0,
              pointerEvents: 'none',
              zIndex: -1,
            }}
            aria-hidden
          />
        )
      })}
    </div>
  )
}

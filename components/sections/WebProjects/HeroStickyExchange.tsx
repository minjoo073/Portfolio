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

import { useRef } from 'react'
import type { Project } from '@/lib/types/project'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useLenis } from '@/lib/hooks/useLenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ── 상수 ────────────────────────────────────────────────────────── */
const EDGE_RING = 'inset 0 0 0 1px #0A0A0A'

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

/* ── 외부 링크 ──────────────────────────────────────────────────── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/ext inline-flex items-center gap-1.5 transition-colors duration-300"
      style={{ fontSize: vw(13, 11), color: 'rgba(248,247,244,0.55)' }}
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
      className="absolute inset-0 bg-dark-soft transition-[filter,box-shadow] duration-500 ease-out"
      style={{
        backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backfaceVisibility: 'hidden',
        boxShadow: EDGE_RING,
        filter: project.dimThumb ? 'brightness(0.9)' : undefined,
        willChange: 'opacity, transform',
      }}
      data-visual-img
    />
  )

  return (
    <div
      className="absolute inset-0 flex items-center"
      style={{
        // 비주얼 컬럼을 그리드 5번 트랙 영역과 맞추기 위해 포지션은 부모가 처리
        opacity: index === 0 ? 1 : 0,
        // 초기 scale: 비활성 카드는 살짝 확대 (crossfade 시 줌아웃 효과)
        transform: index === 0 ? 'scale(1)' : 'scale(1.04)',
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
        // 초기: 첫 카드 보임, 나머지 opacity 0 + 미세 y 20px (큰 슬라이드 X)
        opacity: index === 0 ? 1 : 0,
        transform: index === 0 ? 'translateY(0)' : 'translateY(20px)',
        willChange: 'opacity, transform',
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
          className="font-kr text-ink-inverse/65"
          style={{ fontSize: vw(18, 14), letterSpacing: '-0.01em', fontWeight: 400, marginTop: vw(24, 18) }}
        >
          {project.tagline}
        </p>
      )}

      {/* 역할 */}
      {roleStr && (
        <p
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(14, 12), fontWeight: 400, marginTop: vw(20, 16) }}
        >
          {roleStr}
        </p>
      )}

      {/* 스택 칩 */}
      {hasStacks && (
        <div className="flex flex-wrap gap-2" style={{ marginTop: vw(20, 16) }}>
          {stacks.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: vw(32, 24) }}>
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
              style={{ fontSize: vw(18, 14) }}
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
            <span className="font-kr text-ink-inverse/35" style={{ fontSize: vw(18, 14) }}>제작과정 준비중</span>
          </span>
        )}

        <div
          className="bg-ink-inverse/15"
          style={{ height: '1px', width: '100%', marginTop: vw(20, 16), marginBottom: vw(20, 16) }}
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
  const roles = (project.role ?? []).filter(r => r !== '—')
  const roleStr = roles.length > 0 ? roles.join(' · ') : null

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
        <span
          className="font-mono text-ink-inverse/50"
          style={{ fontSize: vw(13, 11), lineHeight: 1.8, letterSpacing: '0.08em' }}
        >
          {krDate(project.date)}
        </span>
        <span
          className="font-kr text-ink-inverse/50"
          style={{ fontSize: vw(13, 11), lineHeight: 1.8, letterSpacing: '0.08em' }}
        >
          {project.category}
        </span>
        <span
          className="font-kr"
          style={{
            fontSize: vw(15, 13),
            lineHeight: 1.8,
            letterSpacing: '0.08em',
            color: project.workType === 'original'
              ? 'rgba(248,247,244,0.9)'
              : 'rgba(248,247,244,0.5)',
          }}
        >
          {project.workType === 'original' ? '오리지널' : '리디자인'}
        </span>
        {project.scale && (
          <span
            className="font-kr"
            style={{
              fontSize: vw(15, 13),
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
        {roleStr && (
          <span
            className="font-kr text-ink-inverse/50"
            style={{ fontSize: vw(13, 11), lineHeight: 1.8, letterSpacing: '0.08em' }}
          >
            {roleStr}
          </span>
        )}
      </div>
    </div>
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
  const sectionRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  // Lenis 인스턴스를 ref 에 보관 — wheel 핸들러 클로저에서 최신값 접근
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  useGsapContext(
    () => {
      registerGsap()

      const section = sectionRef.current
      if (!section) return

      // ── reduced-motion: wheel 핸들러 없이 자연 스크롤 ──────
      if (reduced) return

      const count = projects.length
      if (count < 2) return

      // ── 패널 요소 수집 ────────────────────────────────────────
      const visualPanels = Array.from(section.querySelectorAll<HTMLElement>('[data-visual-panel]'))
      const bodyPanels   = Array.from(section.querySelectorAll<HTMLElement>('[data-body-panel]'))
      const metaPanels   = Array.from(section.querySelectorAll<HTMLElement>('[data-meta-panel]'))

      if (visualPanels.length !== count || bodyPanels.length !== count) return

      // ── 초기 상태 강제 설정 ───────────────────────────────────
      gsap.set(visualPanels[0], { opacity: 1, scale: 1 })
      bodyPanels[0] && gsap.set(bodyPanels[0], { y: 0 })
      metaPanels[0] && gsap.set(metaPanels[0], { y: 0 })

      visualPanels.slice(1).forEach(el => gsap.set(el, { opacity: 0, scale: 1.04 }))
      bodyPanels.slice(1).forEach(el => gsap.set(el, { y: 20, opacity: 0 }))
      metaPanels.slice(1).forEach(el => gsap.set(el, { y: 20, opacity: 0 }))

      // ── step animation 팩토리 ─────────────────────────────────
      // activeIndex 카드를 활성화하는 paused timeline 생성
      // 매번 새 timeline 을 만들어 play(0) 으로 즉시 실행
      const buildStepTl = (activeIndex: number) => {
        const tl = gsap.timeline({ paused: true })

        visualPanels.forEach((vis, i) => {
          if (i === activeIndex) {
            tl.to(vis, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.inOut' }, 0)
          } else {
            tl.to(vis, { opacity: 0, scale: 1.04, duration: 0.6, ease: 'power3.inOut' }, 0)
          }
        })

        bodyPanels.forEach((body, i) => {
          if (i === activeIndex) {
            tl.to(body, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.inOut' }, 0)
          } else if (i < activeIndex) {
            tl.to(body, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
          } else {
            tl.to(body, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
          }
        })

        metaPanels.forEach((meta, i) => {
          if (i === activeIndex) {
            tl.to(meta, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.inOut' }, 0)
          } else if (i < activeIndex) {
            tl.to(meta, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
          } else {
            tl.to(meta, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
          }
        })

        return tl
      }

      // step timeline 캐시 — 각 카드별 1개 미리 생성
      const stepTls = projects.map((_, i) => buildStepTl(i))

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
      })

      // ── Wheel 기반 단방향 1칸 이동 ────────────────────────────
      // Cooldown: 한 번 이동 후 COOLDOWN_MS 동안 추가 wheel 무시
      const COOLDOWN_MS = 900
      const MIN_DELTA   = 5   // 미세 진동 필터링

      let currentActive = 0
      let cooldown      = false

      // sticky 구간 체크 — section tall 컨테이너가 viewport 를 점유 중인지
      // (= sticky wrapper 가 실제로 고정 상태인지)
      const isPinActive = () => {
        const rect = section.getBoundingClientRect()
        // top ≤ 0 이고 bottom ≥ innerHeight → sticky 잡힌 상태
        return rect.top <= 1 && rect.bottom >= window.innerHeight - 1
      }

      const goTo = (nextIndex: number) => {
        currentActive = nextIndex
        stepTls[nextIndex]?.play(0)

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

          // 05(마지막) 도달 후 추가 wheel down → 자유 스크롤로 Archive 진입
          if (currentActive >= count - 1) return

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

          // 01(첫 번째) 도달 후 wheel up → 자유 스크롤로 Hero 위 진입
          if (currentActive <= 0) return

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
    [] // 마운트 1회
  )

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
      {projects.map((_, i) => (
        <div
          key={i}
          data-step-marker
          data-step={i}
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
      ))}
    </div>
  )
}

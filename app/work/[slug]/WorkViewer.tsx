'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Work } from '@/data/works'
import { works } from '@/data/works'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { cn } from '@/lib/utils/cn'

type DropState = 'idle' | 'dropping' | 'dropped'

interface WorkViewerProps {
  work: Work
  nextWork: Work | null
}

// 케이스스터디 콘텐츠 확장 정책 — 두 가지 패턴
//
// 패턴 A (buja/lp/mathhub): .wrap 만 1440 캡, .section bg-* 는 iframe 전체 폭 채움.
//   로고가 섹션 bg 위에 얹혀 "케이스 위에 올라간" 느낌.
//
// 패턴 B (lunare/fancive): 케이스 전체에 transform:scale 적용해 iframe 폭에 맞춰 자연 확대.
//   override 없이 원본 메커니즘 그대로 사용 → 로고가 scale 된 케이스 위에 얹힘.
//   (1440 강제 캡은 케이스를 가운데 1440 으로 쪼그라뜨려 양옆 빈공간 발생 → 사용자 거부)
//
// 부모(WorkViewer)에서 iframe.contentDocument.head 에 주입한다(same-origin).
const SLUG_OVERRIDES: Record<string, string> = {
  mathhub: `.wrap{max-width: 1440px !important; margin-inline: auto !important}`,
  lp: `.wrap{max-width: 1440px !important; margin-inline: auto !important}`,
  buja: `.wrap{max-width: 1440px !important; margin-inline: auto !important}`,
  // fancive, lunare 는 자체 scale 메커니즘 사용 — 캡 X
}

/**
 * 케이스스터디 뷰어 — vanholtz.co 구조 + 균일 여백 확장 레이아웃.
 *
 * 레이아웃 (모든 뷰포트 균일 여백 48px):
 *   iframe 박스: top/좌우/하 모두 48px, max 1824 — 뷰포트 확장 시 박스만 확장
 *   콘텐츠는 슬러그별 CSS override 로 1440 캡 → "배경만 확장" 효과
 *
 * 로고 / Back 뷰포트 분기 (1700px 임계값):
 *   ≥1700px: 거터 안쪽으로 로고 진입. 콘텐츠 가장자리 24px 옆에 PARK/MIN/JOO 3줄 outline.
 *            Back은 우측 대칭, 큰 ← SVG.
 *   <1700px: 좌상단 corner 에 가로 "PARK MINJOO" outline 26px. Back은 우상단 corner.
 *
 * 드롭 2단계: atEnd 시 dropping → dropped → idle 복귀.
 */
export function WorkViewer({ work, nextWork }: WorkViewerProps) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  const [atEnd, setAtEnd] = useState(false)
  const [dropState, setDropState] = useState<DropState>('idle')
  const [isLargeViewport, setIsLargeViewport] = useState(false)
  const [logoHeight, setLogoHeight] = useState(220)
  // 로고가 스크롤 중간(콘텐츠 위)에 있을 때 반투명. 맨 위 200px 또는 끝 600px 이내에서는 불투명.
  const [logoOpaque, setLogoOpaque] = useState(true)
  // 케이스→케이스 전환 중. 로고 상승 애니메이션 + 캔버스 블랭크 → 라우터 이동.
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isTransitioningRef = useRef(false)
  useEffect(() => { isTransitioningRef.current = isTransitioning }, [isTransitioning])
  // NEXT 오버레이 클릭 트리거 동조 hover — 타이틀 / ↳ turn page 둘 중 하나 hover 시 양쪽 active
  const [triggerHover, setTriggerHover] = useState(false)
  const reduced = useReducedMotionContext()

  useEffect(() => {
    function check() {
      // 1820 = 콘텐츠 1440 + 좌우 거터 190px (iframe-left 48 + 로고 24 gap + 로고 폭 ~118)
      // 1820 미만은 거터가 좁아 로고/Back이 콘텐츠와 겹치므로 corner 모드 유지
      setIsLargeViewport(window.innerWidth >= 1820)
    }
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const el = logoRef.current
    if (!el) return
    const h = el.offsetHeight
    if (h > 0) setLogoHeight(h)

    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (h > 0) setLogoHeight(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isLargeViewport])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    setAtEnd(false)

    const iframe = iframeRef.current
    if (!iframe) return

    let iframeWin: (Window & typeof globalThis) | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    function checkScrollEnd() {
      if (!iframeWin) return
      const doc = iframeWin.document.documentElement
      const scrollHeight = doc.scrollHeight
      const scrollY = iframeWin.scrollY
      const innerHeight = iframeWin.innerHeight
      const distFromTop = scrollY
      const distFromEnd = scrollHeight - (scrollY + innerHeight)
      setAtEnd(distFromEnd <= 200)
      // 맨 위(200 이내) 또는 끝 근처(600 이내) 에서는 opaque, 그 외 중간은 translucent
      setLogoOpaque(distFromTop <= 200 || distFromEnd <= 600)
    }

    function injectSlugOverride() {
      if (!iframeWin) return
      const css = SLUG_OVERRIDES[work.slug]
      if (!css) return
      const doc = iframeWin.document
      // 중복 주입 방지
      if (doc.getElementById('__work_viewer_override__')) return
      const style = doc.createElement('style')
      style.id = '__work_viewer_override__'
      style.textContent = css
      doc.head.appendChild(style)
    }

    function onIframeLoad() {
      try {
        iframeWin = iframe!.contentWindow as (Window & typeof globalThis)
        if (!iframeWin) return

        injectSlugOverride()
        iframeWin.addEventListener('scroll', checkScrollEnd, { passive: true })

        if (intervalId) clearInterval(intervalId)
        intervalId = setInterval(checkScrollEnd, 250)

        setTimeout(checkScrollEnd, 200)
      } catch {
        // cross-origin은 발생하지 않아야 하지만 방어
      }
    }

    if (iframe.contentDocument?.readyState === 'complete') {
      onIframeLoad()
    } else {
      iframe.addEventListener('load', onIframeLoad)
    }

    return () => {
      iframe.removeEventListener('load', onIframeLoad)
      if (iframeWin) {
        iframeWin.removeEventListener('scroll', checkScrollEnd)
      }
      if (intervalId) clearInterval(intervalId)
    }
  }, [work.slug])

  useEffect(() => {
    function onWheelForward(e: WheelEvent) {
      if (isTransitioningRef.current) {
        e.preventDefault()
        return
      }
      const iframeWin = iframeRef.current?.contentWindow
      if (!iframeWin) return
      e.preventDefault()
      try {
        iframeWin.scrollBy({ top: e.deltaY })
      } catch {
        // same-origin 환경
      }
    }
    window.addEventListener('wheel', onWheelForward, { passive: false })
    return () => window.removeEventListener('wheel', onWheelForward)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isTransitioning) {
      // 전환 중에는 무조건 idle (로고가 위로 상승)
      setDropState('idle')
    } else if (atEnd) {
      setDropState('dropping')
      timer = setTimeout(() => setDropState('dropped'), 600)
    } else {
      setDropState('idle')
    }
    return () => clearTimeout(timer)
  }, [atEnd, isTransitioning])

  // 로고 시작 top — 뷰포트별 다름
  // ≥1700: 48 (iframe top 과 동일선)
  // <1700: 16 (corner)
  const LOGO_TOP = isLargeViewport ? 48 : 16
  const BOTTOM_GAP = isLargeViewport ? 48 : 16

  const dropTransform = (() => {
    switch (dropState) {
      case 'dropping':
        return `translateY(calc(100dvh - ${LOGO_TOP}px - ${logoHeight}px - ${BOTTOM_GAP}px - 12px))`
      case 'dropped':
        return `translateY(calc(100dvh - ${LOGO_TOP}px - ${logoHeight}px - ${BOTTOM_GAP}px))`
      default:
        return 'translateY(0)'
    }
  })()

  const dropTransition = (() => {
    const op = 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)'
    switch (dropState) {
      case 'dropping': return `transform 600ms cubic-bezier(0.55, 0, 1, 0.45), ${op}`
      case 'dropped':  return `transform 180ms cubic-bezier(0.0, 0.0, 0.2, 1), ${op}`
      default:
        // 케이스 간 전환 시 상승은 천천히 (900ms). 일반 idle 복귀는 400ms 유지.
        if (isTransitioning) return `transform 900ms cubic-bezier(0.22, 1, 0.36, 1), ${op}`
        return `transform 400ms cubic-bezier(0.16, 1, 0.3, 1), ${op}`
    }
  })()

  // 차례 인덱스 (1-based)
  const currentIndex = works.findIndex(w => w.slug === work.slug)
  const total = works.length
  const currentNumber = String(currentIndex + 1).padStart(2, '0')
  const totalNumber = String(total).padStart(2, '0')
  const nextNumber = nextWork ? String(currentIndex + 2).padStart(2, '0') : null

  // 좌/우 콘텐츠 패딩 — iframe-left(또는 right) + 48px
  const sidePad = 'calc(max(48px, (100vw - 1824px) / 2) + 48px)'

  function handleNext() {
    if (!nextWork) {
      // 마지막 케이스(mathhub) → 홈 Web Projects 섹션
      sessionStorage.setItem('postNavScrollId', 'work')
      router.push('/', { scroll: false })
      return
    }
    // 케이스 → 케이스 전환: 로고 상승 애니메이션 후 라우터 이동
    // 1100ms = 상승 transition 900ms + 정착 hold 200ms
    setIsTransitioning(true)
    setTimeout(() => {
      router.push(`/work/${nextWork.slug}`)
    }, 1100)
  }

  return (
    <>
      {/*
       * 로고 — 뷰포트 분기
       * ≥1700px: 거터 안쪽 PARK/MIN/JOO 3줄 outline (콘텐츠 좌측 24px 옆)
       * <1700px:  좌상단 corner 가로 outline 26px
       */}
      {isLargeViewport ? (
        <div
          ref={logoRef}
          className="fixed z-50 select-none"
          style={{
            top: '30px',
            // iframe-box 좌측 가장자리에 정렬 (상좌우 30px 통일)
            left: 'max(30px, calc((100vw - 1860px) / 2))',
            transform: dropTransform,
            transition: dropTransition,
            // 스크롤 중간: outline + 흐려짐. 위/끝: solid + 선명.
            opacity: logoOpaque ? 1 : 0.25,
          }}
        >
          <Link
            href="/"
            className="block leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(24px, 2.0vw, 46px)',
              lineHeight: 0.86,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              // 맨 위·끝 근처 = 채워짐(#111). 중간 스크롤 = 투명(테두리만).
              color: logoOpaque ? '#111111' : 'transparent',
              WebkitTextStroke: '0.025em #111111',
              textDecoration: 'none',
              transition: 'color 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            tabIndex={atEnd ? -1 : 0}
            aria-label="홈으로"
          >
            <div>PARK</div>
            <div>MIN</div>
            <div>JOO</div>
          </Link>
        </div>
      ) : (
        <div
          ref={logoRef}
          className="fixed z-50 select-none"
          style={{
            top: '16px',
            left: '16px',
            transform: dropTransform,
            transition: dropTransition,
            // 스크롤 중간: outline + 흐려짐. 위/끝: solid + 선명.
            opacity: logoOpaque ? 1 : 0.25,
          }}
        >
          <Link
            href="/"
            className="block leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '26px',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              // 맨 위·끝 근처 = 채워짐(#111). 중간 스크롤 = 투명(테두리만).
              color: logoOpaque ? '#111111' : 'transparent',
              WebkitTextStroke: '0.025em #111111',
              textDecoration: 'none',
              transition: 'color 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            tabIndex={atEnd ? -1 : 0}
            aria-label="홈으로"
          >
            PARK MINJOO
          </Link>
        </div>
      )}

      {/*
       * 뒤로가기 — 뷰포트 분기
       * ≥1820px: 큰 ← SVG 화살표만 (콘텐츠 우측 8px 옆, 텍스트 없음)
       * <1820px:  우상단 corner 소형 ← Back 텍스트
       */}
      {isLargeViewport ? (
        <Link
          href="/"
          scroll={false}
          onClick={() => sessionStorage.setItem('postNavScrollId', 'work')}
          className="fixed z-50 group block"
          style={{
            top: '30px',
            // iframe-box 우측 가장자리에 정렬 (로고와 대칭)
            right: 'max(30px, calc((100vw - 1860px) / 2))',
            opacity: logoOpaque ? 1 : 0.35,
            transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="뒤로가기"
        >
          <svg
            width="64"
            height="44"
            viewBox="0 0 64 44"
            fill="none"
            className="opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-[opacity,transform] duration-200"
            aria-hidden="true"
          >
            <path
              d="M58 22H6M6 22L22 6M6 22L22 38"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : (
        <Link
          href="/"
          scroll={false}
          onClick={() => sessionStorage.setItem('postNavScrollId', 'work')}
          className={cn(
            'fixed z-50',
            'font-mono text-[11px] uppercase tracking-[0.12em]',
            'text-ink-muted hover:text-ink-primary transition-colors duration-200',
            'flex items-center gap-1.5',
          )}
          style={{
            top: '16px',
            right: '16px',
            opacity: logoOpaque ? 1 : 0.35,
            transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms',
          }}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
          </svg>
          Back
        </Link>
      )}

      {/*
       * 케이스스터디 iframe — 상/좌/우 48px, 하단 0 (CEO 2026-06-19)
       * 하단을 viewport 끝까지 붙여 "제작과정이 아래에서 올라오는" 느낌
       * 상단 border + border-radius 만 시각 효과로 남음 (하단은 viewport 밖)
       */}
      <iframe
        ref={iframeRef}
        src={work.iframeSrc}
        title={`${work.label} Case Study`}
        className="fixed border border-b-0 border-ink-primary/[0.08] bg-canvas"
        style={{
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100% - 60px), 1860px)',
          height: 'calc(100vh - 30px)',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
        }}
        loading="eager"
      />

      {/*
       * NEXT 오버레이 (z-40)
       */}
      {/*
       * NEXT WORK 오버레이 — 매거진 차례(Index) 페이지 메타포 (강디 A+D 결합안)
       *
       * 레이아웃 grid:
       *   좌상  : INDEX  03 / 05  + 1px 룰
       *   좌중  : NEXT WORK 라벨 + "03 — ONVINYL" 거대 타이틀 (좌측 정렬)
       *   우중  : YEAR / ROLE / 한 줄 카피 (세로 메타)
       *   좌하  : ↳ TURN PAGE (로고 옆 — 로고 떨어진 자리 우측)
       *
       * 진입 모션 (순차 페이드+lift):
       *   INDEX 200ms → 타이틀 600ms → 메타 800ms → TURN 1200ms
       */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          // 전환 중에는 솔리드 캔버스로 iframe 완전 가림. 평소 atEnd 상태는 살짝 블러.
          isTransitioning ? 'bg-canvas' : 'bg-canvas/95 backdrop-blur-[2px]',
          'transition-opacity duration-500',
          // 빈 공간은 cursor-default (트리거 텍스트만 cursor-pointer). 클릭은 전체 영역 유지.
          'cursor-default',
          (atEnd || isTransitioning) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={isTransitioning ? undefined : handleNext}
        role="button"
        tabIndex={atEnd && !isTransitioning ? 0 : -1}
        aria-label={nextWork ? `다음 작업: ${nextWork.label}` : '작업 목록으로 돌아가기'}
        onKeyDown={(e) => {
          if (isTransitioning) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleNext()
          }
        }}
      >
        {!isTransitioning && (
          <>
            {/* 좌상 — INDEX + 페이지 인디케이터 + 짧은 1px 룰 (INDEX 옆) */}
            <div
              className="absolute"
              style={{
                top: '48px',
                left: sidePad,
                transform: atEnd ? 'translateY(0)' : 'translateY(8px)',
                opacity: atEnd ? 1 : 0,
                transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms',
                transitionDelay: atEnd ? '200ms' : '0ms',
              }}
            >
              <div className="flex items-baseline gap-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                <span>INDEX</span>
                <span className="text-ink-primary">
                  {currentNumber} <span className="text-ink-muted">/ {totalNumber}</span>
                </span>
              </div>
              {/* 짧은 1px 룰 — INDEX 라벨 양옆 폭만큼만 (Back 화살표 안 닿게) */}
              <div className="mt-3 h-px w-[120px] bg-ink-primary/15" />
            </div>

            {/* 좌중 — 거대 타이틀 (클릭 트리거 #1)
             *  텍스트 자체 변화: outline → solid 좌→우 wipe.
             *  매거진 표지가 잉크로 그려지는 메타포.
             *  reduced motion: solid 직접 표시.
             */}
            <div
              className="absolute"
              style={{
                top: '38vh',
                left: sidePad,
                maxWidth: 'min(56vw, 900px)',
                transform: atEnd ? 'translateY(0)' : 'translateY(16px)',
                opacity: atEnd ? 1 : 0,
                transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms',
                transitionDelay: atEnd ? '600ms' : '0ms',
              }}
            >
              <div
                className="inline-block cursor-pointer relative"
                onMouseEnter={() => setTriggerHover(true)}
                onMouseLeave={() => setTriggerHover(false)}
                aria-hidden="true"
              >
                {/* 베이스 — layout 차지용, 투명 */}
                <h2
                  className="font-display font-medium leading-[1.1] tracking-tight"
                  style={{
                    fontSize: 'clamp(2.5rem, 7vw, 7rem)',
                    letterSpacing: '-0.02em',
                    visibility: 'hidden',
                  }}
                >
                  {nextWork ? `— ${nextWork.label}` : '↑ 처음으로'}
                </h2>
                {/* idle 레이어 — 옅은 회색 솔리드. outline 폐기로 stem 안 라인 해소 */}
                <h2
                  className="font-display font-medium leading-[1.1] tracking-tight absolute inset-0"
                  style={{
                    fontSize: 'clamp(2.5rem, 7vw, 7rem)',
                    letterSpacing: '-0.02em',
                    color: 'rgba(17, 17, 17, 0.2)',
                    visibility: reduced ? 'hidden' : 'visible',
                  }}
                >
                  {nextWork ? `— ${nextWork.label}` : '↑ 처음으로'}
                </h2>
                {/* hover 레이어 — 검정 솔리드, 좌→우 wipe 로 채워짐 */}
                <h2
                  className="font-display font-medium leading-[1.1] tracking-tight absolute inset-0 text-ink-primary"
                  style={{
                    fontSize: 'clamp(2.5rem, 7vw, 7rem)',
                    letterSpacing: '-0.02em',
                    clipPath: reduced
                      ? 'inset(0 0 0 0)'
                      : (triggerHover ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)'),
                    transition: reduced
                      ? 'none'
                      : 'clip-path 800ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {nextWork ? `— ${nextWork.label}` : '↑ 처음으로'}
                </h2>
              </div>
            </div>

            {/* 우중 — 메타 (year/role/tagline) — nextWork 있을 때만 */}
            {nextWork && (
              <div
                className="absolute text-right"
                style={{
                  top: '38vh',
                  right: sidePad,
                  maxWidth: 'min(28vw, 340px)',
                  transform: atEnd ? 'translateY(0)' : 'translateY(16px)',
                  opacity: atEnd ? 1 : 0,
                  transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms',
                  transitionDelay: atEnd ? '800ms' : '0ms',
                }}
              >
                <dl className="space-y-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <div className="flex justify-end gap-3">
                    <dt>YEAR</dt>
                    <dt className="text-ink-primary/30">—</dt>
                    <dd className="text-ink-primary">{nextWork.year}</dd>
                  </div>
                  <div className="flex justify-end gap-3">
                    <dt>ROLE</dt>
                    <dt className="text-ink-primary/30">—</dt>
                    <dd className="text-ink-primary">{nextWork.role}</dd>
                  </div>
                </dl>
                <p className="mt-6 font-sans text-[13px] leading-relaxed text-ink-primary/80 tracking-tight">
                  {nextWork.tagline}
                </p>
              </div>
            )}

            {/* 우하 — ↳ TURN PAGE (클릭 트리거 #2, 로고와 좌우 대칭)
             *  좌하 로고(마침표) ↔ 우하 CTA(다음으로) 분리.
             *  → 화살표가 페이지 우측 가장자리를 가리켜 "물리적 다음" 과 일치.
             */}
            <div
              className="absolute"
              style={{
                right: sidePad,
                // 로고 마지막 줄(JOO) baseline 과 시각 정렬 — line-height 차이로 48px 시 위로 떠 보임
                bottom: '32px',
                transform: atEnd ? 'translateY(0)' : 'translateY(8px)',
                opacity: atEnd ? 1 : 0,
                transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms',
                transitionDelay: atEnd ? '1200ms' : '0ms',
              }}
            >
              {/* turn page 트리거 영역 — 타이틀과 동조 hover */}
              <div
                className="inline-flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setTriggerHover(true)}
                onMouseLeave={() => setTriggerHover(false)}
                aria-hidden="true"
              >
                <p
                  className="font-mono text-[13px] uppercase tracking-[0.18em] flex items-center gap-2"
                  style={{
                    color: '#111111',
                    opacity: triggerHover ? 0.95 : 0.7,
                    transition: reduced ? 'none' : 'opacity 450ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <span style={{ opacity: 0.55 }}>↳</span>
                  <span>{nextWork ? 'turn page' : 'back to index'}</span>
                </p>
                {/* 우측 → 화살표 — hover 시 8px 우측 슬라이드 */}
                <span
                  className="font-mono text-[13px] text-ink-primary"
                  style={{
                    opacity: triggerHover ? 0.95 : 0.4,
                    transform: !reduced && triggerHover ? 'translateX(8px)' : 'translateX(0)',
                    transition: reduced
                      ? 'none'
                      : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms',
                  }}
                >
                  →
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

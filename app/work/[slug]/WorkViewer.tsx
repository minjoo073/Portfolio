'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Work } from '@/data/works'
import { cn } from '@/lib/utils/cn'

type DropState = 'idle' | 'dropping' | 'dropped'

interface WorkViewerProps {
  work: Work
  nextWork: Work | null
}

/**
 * 케이스스터디 뷰어 — vanholtz.co 구조.
 *
 * 레이아웃:
 *   고정 로고 (좌상단) ──► atEnd 시 2단계 드롭 state machine (dropping→dropped)
 *   고정 뒤로가기 (우상단) ──► /#work 앵커
 *   iframe (inset: top 48px / 좌우하단 8px) ── /projects/<slug>/study/ 로드
 *   NEXT 오버레이 (z-40) ── atEnd 시 fade-in, 클릭 → 다음 work
 *
 * 뷰포트 분기 (isLargeViewport, 1700px 임계값):
 *   ≥1700px: 거터 로고 PARK/MIN/JOO (outline, Instrument Sans 700) + 큰 ← SVG 화살표
 *   <1700px:  소형 크롬 PARK MINJOO (mono 11px) + 소형 ← Back 텍스트
 *
 * 드롭 2단계:
 *   dropping → 600ms cubic-bezier(0.55,0,1,0.45) 오버슈트 -12px
 *   dropped  → 180ms cubic-bezier(0,0,0.2,1) settle
 *   idle     → 400ms cubic-bezier(0.16,1,0.3,1) 복귀
 *
 * 스크롤 끝 감지:
 *   1차: iframe.contentWindow 'scroll' 이벤트
 *   2차: 250ms 폴링 폴백
 *   임계값: scrollY + innerHeight >= scrollHeight - 200
 */
export function WorkViewer({ work, nextWork }: WorkViewerProps) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  const [atEnd, setAtEnd] = useState(false)
  const [dropState, setDropState] = useState<DropState>('idle')
  const [isLargeViewport, setIsLargeViewport] = useState(false)
  const [logoHeight, setLogoHeight] = useState(220) // 1920px 기준 추정값, ref 실측으로 교체됨

  // 뷰포트 크기 감시 — 1700px 임계값
  useEffect(() => {
    function check() {
      setIsLargeViewport(window.innerWidth >= 1700)
    }
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // 로고 실측 높이 — ResizeObserver
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
  }, [isLargeViewport]) // 뷰포트 클래스 전환 시 재측정

  // 외부 페이지 스크롤 차단
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // iframe 스크롤 끝 감지
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
      const reached = iframeWin.scrollY + iframeWin.innerHeight >= scrollHeight - 200
      setAtEnd(reached)
    }

    function onIframeLoad() {
      try {
        iframeWin = iframe!.contentWindow as (Window & typeof globalThis)
        if (!iframeWin) return

        // 1차: native scroll event
        iframeWin.addEventListener('scroll', checkScrollEnd, { passive: true })

        // 2차: 폴링 폴백 (Lenis가 native scroll event 억제 시)
        if (intervalId) clearInterval(intervalId)
        intervalId = setInterval(checkScrollEnd, 250)

        // 로드 직후 즉시 체크 (짧은 콘텐츠 대비)
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

  // 거터 / 오버레이 wheel → iframe 실제 스크롤
  //
  // 원리:
  //   iframe 위의 wheel 이벤트는 cross-frame으로 iframe content window가 직접 수신.
  //   parent document까지 bubble되지 않으므로 이 핸들러는 거터/오버레이 이벤트만 받음.
  //   → 더블스크롤 없음, 추가 조건 분기 불필요.
  //
  // 스크롤 방식:
  //   synthetic WheelEvent dispatch는 브라우저 네이티브 스크롤을 트리거하지 않아 동작 불가.
  //   iframeWin.scrollBy({ top: e.deltaY }) 로 실제 scroll position을 직접 이동시킨다.
  //   Lenis 사용 페이지(lp/buja/lunare/fancive)에서 scrollBy는 Lenis 내부 상태와 무관하게
  //   네이티브 스크롤 위치를 직접 변경하므로 실제 스크롤이 일어난다.
  //   부드러움보다 실제 동작이 우선 (CEO 요구사항).
  useEffect(() => {
    function onWheelForward(e: WheelEvent) {
      const iframeWin = iframeRef.current?.contentWindow
      if (!iframeWin) return

      // 외부(거터/오버레이) 스크롤 기본동작 차단
      e.preventDefault()

      try {
        // 합성 이벤트 dispatch 대신 실제 scroll 위치 이동
        iframeWin.scrollBy({ top: e.deltaY })
      } catch {
        // same-origin 환경이므로 발생하지 않아야 함 — 방어 처리
      }
    }

    window.addEventListener('wheel', onWheelForward, { passive: false })
    return () => window.removeEventListener('wheel', onWheelForward)
  }, [])

  // 드롭 state machine — atEnd 변화에 반응
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (atEnd) {
      setDropState('dropping')
      timer = setTimeout(() => setDropState('dropped'), 600)
    } else {
      setDropState('idle')
    }
    return () => clearTimeout(timer)
  }, [atEnd])

  // 로고 위치 기준 (top 값) — 뷰포트별 다름
  const LOGO_TOP = isLargeViewport ? 36 : 14

  // translateY 값 — state별
  const dropTransform = (() => {
    switch (dropState) {
      case 'dropping':
        // 오버슈트: -12px (착지점보다 12px 더 내려감)
        return `translateY(calc(100dvh - ${LOGO_TOP}px - ${logoHeight}px - 48px - 12px))`
      case 'dropped':
        // settle: 정착점 (하단 48px 여백)
        return `translateY(calc(100dvh - ${LOGO_TOP}px - ${logoHeight}px - 48px))`
      default:
        return 'translateY(0)'
    }
  })()

  // transition 값 — state별
  const dropTransition = (() => {
    switch (dropState) {
      case 'dropping': return 'transform 600ms cubic-bezier(0.55, 0, 1, 0.45)'
      case 'dropped':  return 'transform 180ms cubic-bezier(0.0, 0.0, 0.2, 1)'
      default:         return 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)'
    }
  })()

  function handleNext() {
    if (nextWork) {
      router.push(`/work/${nextWork.slug}`)
    } else {
      router.push('/#work')
    }
  }

  return (
    <>
      {/*
       * 로고 — 뷰포트 분기
       * ≥1700px: PARK/MIN/JOO 3줄 아웃라인 (거터 점령)
       * <1700px:  PARK MINJOO 소형 크롬
       * 공통: 드롭 state machine 적용
       */}
      {isLargeViewport ? (
        // 큰 거터 로고 (≥1700px)
        <div
          ref={logoRef}
          className="fixed z-50 select-none"
          style={{
            top: '36px',
            left: '24px',
            transform: dropTransform,
            transition: dropTransition,
          }}
        >
          <Link
            href="/"
            className="flex flex-col"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              // 거터 폭에 비례하되 콘텐츠 침범 방지: 거터(좌우합=100vw-1440)의 절반 - 좌우 패딩에 맞춤
              fontSize: 'min(calc((100vw - 1440px) * 0.17), 100px)',
              lineHeight: 0.86,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: 'transparent',
              WebkitTextStroke: '0.045em #111111',
              textDecoration: 'none',
            }}
            tabIndex={atEnd ? -1 : 0}
            aria-label="홈으로"
          >
            <span>PARK</span>
            <span>MIN</span>
            <span>JOO</span>
          </Link>
        </div>
      ) : (
        // 소형 크롬 로고 (<1700px)
        <div
          ref={logoRef}
          className="fixed z-50 select-none"
          style={{
            top: '14px',
            left: 'max(16px, calc((100vw - 1440px) / 2))',
            transform: dropTransform,
            transition: dropTransition,
          }}
        >
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-primary opacity-70 hover:opacity-100 transition-opacity duration-200"
            tabIndex={atEnd ? -1 : 0}
            aria-label="홈으로"
          >
            PARK MINJOO
          </Link>
        </div>
      )}

      {/*
       * 뒤로가기 — 뷰포트 분기
       * ≥1700px: 큰 SVG 화살표 64×44, stroke 2px #111, hover translateX(-4px)
       * <1700px:  소형 ← Back 텍스트
       */}
      {isLargeViewport ? (
        // 큰 ← 화살표 (≥1700px)
        <Link
          href="/#work"
          className="fixed z-50 group block"
          style={{ top: '40px', right: '40px' }}
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
        // 소형 ← Back 텍스트 (<1700px)
        <Link
          href="/#work"
          className={cn(
            'fixed z-50',
            'font-mono text-[11px] uppercase tracking-[0.12em]',
            'text-ink-muted hover:text-ink-primary transition-colors duration-200',
            'flex items-center gap-1.5',
          )}
          style={{ top: '14px', right: 'max(16px, calc((100vw - 1440px) / 2))' }}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
          </svg>
          Back
        </Link>
      )}

      {/*
       * 케이스스터디 iframe — inset
       * top 48px: 헤더 영역 / 좌우하단 8px: 살짝 뜬 느낌
       * max-width 1440px, translateX(-50%) 가운데 정렬 — 변경 없음
       */}
      <iframe
        ref={iframeRef}
        src={work.iframeSrc}
        title={`${work.label} Case Study`}
        className="fixed rounded-sm border border-ink-primary/[0.08] bg-canvas"
        style={{
          top: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100% - 16px), 1440px)',
          height: 'calc(100vh - 56px)',
        }}
        loading="eager"
      />

      {/*
       * NEXT 오버레이 (z-40) — 로고 z-50이 위에 앉음
       * 0ms: overlay fade-in 시작 (500ms)
       * 100ms: h2 translateY+opacity 시작 (delay 100ms)
       *
       * mathhub(마지막): nextWork = null → "↑ 처음으로"
       */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          'flex flex-col items-center justify-center',
          'bg-canvas/95 backdrop-blur-[2px]',
          'transition-opacity duration-500',
          'cursor-pointer',
          atEnd ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={handleNext}
        role="button"
        tabIndex={atEnd ? 0 : -1}
        aria-label={nextWork ? `다음 작업: ${nextWork.label}` : '작업 목록으로 돌아가기'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleNext()
          }
        }}
      >
        {/* 레이블 */}
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-5">
          {nextWork ? 'next work' : 'all works'}
        </p>

        {/* 타이틀 — 100ms delay, translateY+opacity */}
        <h2
          className="font-display font-medium tracking-tight leading-none text-ink-primary"
          style={{
            fontSize: 'clamp(3rem, 10vw, 10rem)',
            transform: atEnd ? 'translateY(0)' : 'translateY(1rem)',
            opacity: atEnd ? 1 : 0,
            transition: 'transform 500ms, opacity 500ms',
            transitionDelay: atEnd ? '100ms' : '0ms',
          }}
        >
          {nextWork ? `— ${nextWork.label}` : '↑ 처음으로'}
        </h2>

        {/* 클릭 힌트 */}
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted/60 mt-8">
          click anywhere
        </p>
      </div>
    </>
  )
}

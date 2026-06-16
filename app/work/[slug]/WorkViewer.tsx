'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Work } from '@/data/works'
import { cn } from '@/lib/utils/cn'

interface WorkViewerProps {
  work: Work
  nextWork: Work | null
}

/**
 * 케이스스터디 뷰어 — vanholtz.co 구조.
 *
 * 레이아웃:
 *   고정 로고 (좌상단) ──► atEnd 시 하단으로 '툭' 드롭 (translateY)
 *   고정 뒤로가기 (우상단) ──► /#work 앵커
 *   iframe (inset: top 48px / 좌우하단 8px) ── /projects/<slug>/study/ 로드
 *   NEXT 오버레이 (z-40) ── atEnd 시 fade-in, 클릭 → 다음 work
 *
 * 스크롤 끝 감지:
 *   1차: iframe.contentWindow 'scroll' 이벤트 (native scroll — Lenis도 scrollY 갱신함)
 *   2차: 250ms 폴링 (Lenis가 native scroll event를 suppress하는 경우 폴백)
 *   임계값: scrollY + innerHeight >= scrollHeight - 200
 */
export function WorkViewer({ work, nextWork }: WorkViewerProps) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [atEnd, setAtEnd] = useState(false)

  // 외부 페이지 스크롤 차단 (Lenis가 outer document를 건드리지 않도록)
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

    // 이미 로드된 경우 즉시 셋업
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
       * 로고 — 좌상단 고정
       * atEnd: translateY(calc(100vh - 56px)) 로 하단 드롭 ('툭' 떨어지는 ease-in)
       * 복귀: ease-out 으로 부드럽게 상단으로
       */}
      <div
        className="fixed left-4 z-50 select-none"
        style={{
          top: '14px',
          transform: atEnd ? 'translateY(calc(100vh - 56px))' : 'translateY(0)',
          transition: atEnd
            ? 'transform 0.55s cubic-bezier(0.4, 0, 1, 1)'
            : 'transform 0.4s cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        {/*
         * 강디 비주얼 지점 A: 로고 마크/워드마크 교체
         * 현재: 텍스트 'PARK MINJOO' (모노, 중립)
         */}
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-primary opacity-70 hover:opacity-100 transition-opacity duration-200"
          tabIndex={atEnd ? -1 : 0}
          aria-label="홈으로"
        >
          PARK MINJOO
        </Link>
      </div>

      {/*
       * 뒤로가기 — 우상단 고정
       * 강디 비주얼 지점 B: 버튼 스타일/아이콘 교체
       */}
      <Link
        href="/#work"
        className={cn(
          'fixed right-4 z-50',
          'font-mono text-[11px] uppercase tracking-[0.12em]',
          'text-ink-muted hover:text-ink-primary transition-colors duration-200',
          'flex items-center gap-1.5',
        )}
        style={{ top: '14px' }}
      >
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
          <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
        </svg>
        Back
      </Link>

      {/*
       * 케이스스터디 iframe — inset
       * top 48px: 헤더 영역 / 좌우하단 8px: 살짝 뜬 느낌
       * 강디 비주얼 지점 C: border, border-radius, 배경색 조정
       */}
      <iframe
        ref={iframeRef}
        src={work.iframeSrc}
        title={`${work.label} Case Study`}
        className="fixed rounded-sm border border-ink-primary/[0.08] bg-canvas"
        style={{
          top: '48px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          width: 'calc(100% - 16px)',
          height: 'calc(100vh - 56px)',
        }}
        loading="eager"
      />

      {/*
       * NEXT 오버레이 — atEnd 시 fade-in
       * 강디 비주얼 지점 D: 배경 투명도, 타이포 크기/웨이트, 등장 애니메이션
       *
       * mathhub(마지막): nextWork = null → "↑ 처음으로" 표시
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

        {/*
         * 강디 비주얼 지점 D-1: 'NEXT — LABEL' 타이포 크기, 웨이트, 폰트
         * 현재: display font, clamp 3rem~10rem, medium
         */}
        <h2
          className={cn(
            'font-display font-medium tracking-tight leading-none',
            'text-ink-primary',
            'transition-transform duration-500',
            atEnd ? 'translate-y-0' : 'translate-y-4',
          )}
          style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
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

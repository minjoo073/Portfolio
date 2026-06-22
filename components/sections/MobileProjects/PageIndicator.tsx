'use client'

/**
 * PageIndicator — 우측 하단 슬라이드 인디케이터
 *
 * currentPage 변경 시:
 *   1. 현재 텍스트 위로 퇴장 (0.25s power2.in)
 *   2. 새 텍스트로 교체 후 아래서 진입 (0.3s power2.out)
 *
 * 위치: MobileProjects sticky wrapper 내부 absolute 배치 (외부에서 제어)
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface PageIndicatorProps {
  currentPage: number
  total: number
}

export function PageIndicator({ currentPage, total }: PageIndicatorProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const prevPageRef = useRef(currentPage)

  const formatLabel = (page: number) =>
    `${String(page + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  useEffect(() => {
    const textEl = textRef.current
    if (!textEl) return

    // 최초 마운트: 애니 없이 텍스트만 세팅
    if (prevPageRef.current === currentPage && textEl.textContent === '') {
      textEl.textContent = formatLabel(currentPage)
      return
    }

    if (prevPageRef.current === currentPage) return
    prevPageRef.current = currentPage

    // 퇴장 → 텍스트 교체 → 진입
    gsap.to(textEl, {
      y: '-1.4em',
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        textEl.textContent = formatLabel(currentPage)
        gsap.fromTo(
          textEl,
          { y: '1.4em', opacity: 0 },
          { y: '0em', opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 최초 마운트 시 텍스트 초기화
  useEffect(() => {
    const textEl = textRef.current
    if (textEl && !textEl.textContent) {
      textEl.textContent = formatLabel(currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '1.4em',
      }}
      aria-live="polite"
      aria-label={`페이지 ${currentPage + 1} / ${total}`}
    >
      <span
        ref={textRef}
        style={{
          display: 'block',
          fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
          fontSize: 'clamp(11px, 0.7vw, 13px)',
          letterSpacing: '0.18em',
          color: 'rgba(248,247,244,0.40)',
          position: 'absolute',
          whiteSpace: 'nowrap',
        }}
        aria-hidden
      />
    </div>
  )
}

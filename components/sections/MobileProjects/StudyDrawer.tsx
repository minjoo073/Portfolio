'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from '@/lib/hooks/useLenis'

interface StudyDrawerProps {
  open: boolean
  onClose: () => void
  src: string
  title: string
}

/**
 * StudyDrawer — 우측 슬라이드 팝업.
 *
 * - 열릴 때 Lenis.stop() / document.body overflow:hidden (Lenis 미초기화 폴백)
 * - 닫힐 때 Lenis.start() / overflow 해제
 * - ESC 키 닫기
 * - 배경 dim 클릭 닫기
 * - iframe src: 외부 GitHub Pages URL 임베드 시도
 *   X-Frame-Options 차단 시 폴백 버튼("새 탭에서 열기") 자동 노출
 */
export function StudyDrawer({ open, onClose, src, title }: StudyDrawerProps) {
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // CEO 가 iframe 차단 확인 시 true 로 전환 → 폴백 UI 노출
  const [iframeBlocked] = useState(false)
  // Portal mount 가드 — SSR/hydration 안전
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // 매 open 시점에 새 timestamp → GitHub Pages 캐시 강제 무효화
  const [bustKey, setBustKey] = useState(0)

  lenisRef.current = lenis

  useEffect(() => {
    if (open) setBustKey(Date.now())
  }, [open])

  const bustedSrc = bustKey
    ? `${src}${src.includes('?') ? '&' : '?'}v=${bustKey}`
    : src

  // iframe X-Frame-Options 차단 감지 불가 (브라우저 보안 정책)
  // 차단 시 CEO 가 iframeBlocked=true 로 수동 전환하거나 별도 프록시 처리 필요

  // 스크롤 잠금 / 해제
  useEffect(() => {
    const l = lenisRef.current
    if (open) {
      if (l) {
        l.stop()
      } else {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (l) {
        l.start()
      } else {
        document.body.style.overflow = ''
      }
    }
    return () => {
      // 언마운트 시 반드시 해제
      if (l) l.start()
      else document.body.style.overflow = ''
    }
  }, [open])

  // ESC 닫기
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // open 될 때 iframe focus → 접근성
  useEffect(() => {
    if (open && iframeRef.current) {
      // 약간의 지연 후 focus (슬라이드 애니 완료 후)
      const t = setTimeout(() => iframeRef.current?.focus(), 460)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!mounted) return null

  // createPortal → document.body 에 직접 렌더 (부모 transform 영향 회피)
  return createPortal(
    <>
      {/* dim 오버레이 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 350ms ease',
        }}
      />

      {/* 닫기 — drawer 좌측 dim 영역에 floating */}
      <button
        onClick={onClose}
        aria-label="닫기"
        style={{
          position: 'fixed',
          top: '32px',
          left: '32px',
          zIndex: 102,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid rgba(248,247,244,0.32)',
          background: 'transparent',
          cursor: 'pointer',
          color: '#F8F7F4',
          fontSize: '20px',
          lineHeight: 1,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 350ms ease, background 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = 'rgba(248,247,244,0.10)'
          el.style.borderColor = 'rgba(248,247,244,0.55)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = 'transparent'
          el.style.borderColor = 'rgba(248,247,244,0.32)'
        }}
      >
        ×
      </button>

      {/* off-canvas 클리핑 래퍼 — 닫힘(translateX(100%)) 시 화면 밖 패널이
          문서 가로 스크롤을 만들지 않도록 viewport 폭으로 클립.
          fixed 요소라 body overflow-x:clip 으로는 안 잡혀서 국소 래퍼 필요.
          overflow-x:clip = 스크롤 컨테이너 미생성 → 세로 그림자/스크롤 영향 없음. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 101,
          pointerEvents: 'none',
          overflowX: 'clip',
        }}
      >
        {/* drawer panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 제작과정`}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: 'min(80%, 1400px)',
            background: '#fff',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 450ms cubic-bezier(0.22,0.61,0.36,1)',
            pointerEvents: open ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-24px 0 80px rgba(0,0,0,0.32)',
          }}
        >
        {/* iframe 영역 — wrapper 에도 data-lenis-prevent (closest 매칭용 안전망) */}
        <div
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          data-lenis-prevent
        >
          {open && (
            <iframe
              ref={iframeRef}
              key={bustKey}
              src={bustedSrc}
              title={`${title} 제작과정`}
              scrolling="yes"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              data-lenis-prevent
            />
          )}

          {/* X-Frame-Options 차단 폴백 — CEO 가 차단 확인 시 iframeBlocked=true 로 전환 */}
          {iframeBlocked && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                background: '#fafaf9',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-pretendard), sans-serif',
                  fontSize: '14px',
                  color: 'rgba(17,17,17,0.55)',
                  textAlign: 'center',
                }}
              >
                제작과정 페이지를 이 창에서 불러올 수 없습니다.
              </p>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-pretendard), sans-serif',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#111',
                  textDecoration: 'none',
                  padding: '10px 24px',
                  border: '1px solid rgba(17,17,17,0.24)',
                  borderRadius: '4px',
                  transition: 'background 200ms ease',
                }}
              >
                새 탭에서 열기 ↗
              </a>
            </div>
          )}
        </div>
      </aside>
      </div>
    </>,
    document.body
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from '@/lib/hooks/useLenis'
import { freelanceItems } from '@/data/freelance'

interface FreelanceModalProps {
  open: boolean
  onClose: () => void
}

/**
 * FreelanceModal — 외주(CLIENT) 풀스크린 오버레이.
 *
 * 메인에 섹션으로 두지 않고 CLIENT 네비 클릭 시에만 화면 전체를 덮는 오버레이로 노출.
 * 한 화면에 2×2 그리드로 짧은 설명 + 섬네일만 (제작과정/케이스 X).
 *
 * - createPortal → body 직접 렌더 (부모 transform/stacking 영향 회피)
 * - 열림 시 Lenis.stop() + body overflow:hidden, 배경 wheel/touch 차단
 * - ESC 닫기, 닫기 버튼
 * - 에디토리얼 톤 (박스 카드·글라스 회피) — canvas 풀블리드 + 헤어라인 + 모노 캡션
 */
export function FreelanceModal({ open, onClose }: FreelanceModalProps) {
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  // Portal mount 가드 (SSR/hydration 안전)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // 스크롤 잠금 — Lenis stop + body overflow (이중 안전)
  useEffect(() => {
    const l = lenisRef.current
    if (open) {
      l?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      l?.start()
      document.body.style.overflow = ''
    }
    return () => {
      l?.start()
      document.body.style.overflow = ''
    }
  }, [open])

  // 배경은 잠그고 모달 내부만 스크롤.
  // lenis.stop() 정지 상태에서 wheel 이 preventDefault 돼 네이티브 overflow 스크롤이
  // 막히므로, 모달 컨테이너를 직접 scrollTop 으로 굴린다(휠). 터치는 네이티브 허용.
  useEffect(() => {
    if (!open) return
    const onWheel = (e: WheelEvent) => {
      const scroller = (e.target as HTMLElement | null)?.closest('[data-modal-scroll]') as HTMLElement | null
      if (scroller) scroller.scrollTop += e.deltaY
      e.preventDefault() // 배경 페이지 스크롤 차단
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest('[data-modal-scroll]')) return // 모달 내부 터치는 네이티브 스크롤
      e.preventDefault()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouch, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [open])

  // ESC 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="외주 작업"
      aria-hidden={!open}
      data-modal-scroll
      className="fixed inset-0 overflow-y-auto bg-canvas text-ink-primary [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        zIndex: 500, // z-overlay (nav 100 위)
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 480ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      data-lenis-prevent
    >
      <div className="mx-auto min-h-full max-w-container px-side-m py-16 md:px-side-t md:py-20 xl:px-side-d">
        {/* ── 헤더 ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6">
          <div
            style={{
              transform: open ? 'translateY(0)' : 'translateY(12px)',
              opacity: open ? 1 : 0,
              transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1), opacity 600ms',
              transitionDelay: open ? '120ms' : '0ms',
            }}
          >
            <p className="font-mono text-label uppercase tracking-[0.18em] text-ink-muted">
              External · Commissioned — {String(freelanceItems.length).padStart(2, '0')}
            </p>
            <h2 className="mt-3 font-display text-display-m leading-[1.02]">
              Client Work
            </h2>
            <p className="mt-5 max-w-md font-kr text-body leading-relaxed text-ink-muted">
              의뢰받아 진행한 외주 작업 — Cafe24 커머스 스킨부터 웹 에이전시 사이트
              구축까지. 케이스 스터디가 아닌 결과물·역할 중심으로 짧게 정리했습니다.
            </p>
          </div>

          {/* 닫기 — × + CLOSE 텍스트 (테두리 원 없음), hover 시 밑줄 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="group mt-1 flex shrink-0 items-center gap-2.5 font-mono text-label uppercase tracking-[0.14em] text-ink-primary"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 ease-out-soft group-hover:rotate-90">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
            <span className="relative after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
              Close
            </span>
            <span aria-hidden="true" className="text-[9px] text-ink-muted">Esc</span>
          </button>
        </div>

        {/* 헤어라인 */}
        <div className="mt-8 h-px w-full bg-ink-primary/12 md:mt-10" />

        {/* ── 2×2 그리드 ───────────────────────────────────────── */}
        <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 md:mt-14 md:gap-x-14 md:gap-y-16">
          {freelanceItems.map((item, i) => {
            const Wrapper = item.href ? 'a' : 'div'
            return (
              <li
                key={item.index}
                style={{
                  transform: open ? 'translateY(0)' : 'translateY(16px)',
                  opacity: open ? 1 : 0,
                  transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1), opacity 600ms',
                  transitionDelay: open ? `${240 + i * 90}ms` : '0ms',
                }}
              >
                <Wrapper
                  {...(item.href
                    ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="group block"
                >
                  {/* 섬네일 — 이미지 또는 placeholder */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink-primary/10 bg-[#ECEBE7]">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-label uppercase tracking-[0.2em] text-ink-muted/60">
                        Image
                      </span>
                    )}
                  </div>

                  {/* 메타 */}
                  <div className="mt-5 flex items-baseline justify-between font-mono text-label uppercase tracking-[0.14em] text-ink-muted">
                    <span className="text-ink-primary">{item.index}</span>
                    <span>{item.category}{item.year ? ` · ${item.year}` : ''}</span>
                  </div>

                  <h3 className="mt-3 font-kr text-heading leading-tight text-ink-primary">
                    <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out-soft group-hover:bg-[length:100%_1px]">
                      {item.title}
                      {item.href ? <span aria-hidden="true" className="ml-1.5 text-ink-muted">↗</span> : null}
                    </span>
                  </h3>

                  <p className="mt-2 max-w-md font-kr text-body text-ink-muted">
                    {item.description}
                  </p>
                </Wrapper>
              </li>
            )
          })}
        </ul>
      </div>
    </div>,
    document.body,
  )
}

'use client'

/**
 * Intro — 균열(Fissure) 인트로 오버레이.
 *
 * 컨셉 A (강디 설계, CEO 승인·수정 2026-06-17):
 *   #EBEBEB 오버레이 위 가운데 "PARK MINJOO" 등장
 *   → PARK 좌 / MINJOO 우 로 *페이지 양끝까지* 벌어지며
 *      *두 단어 사이 빈 틈*에만 가로선이 그어짐 (글자 위는 절대 안 지나감)
 *   → 텍스트가 끝에 닿으면 상·하 오버레이가 가로선 따라 열림 → 히어로 노출.
 *
 * 선 처리(핵심):
 *   - 선은 PARK 오른끝 ~ MINJOO 왼끝 *틈* 에만 존재. 매 프레임 단어 rect 추적
 *     (left = parkRight, width = minjooLeft - parkRight). → 글자 위로 안 지나감.
 *   - 선 수직 위치 = 텍스트 실제 중심(빈 틈이라 글자와 안 겹침).
 *
 * 측정 기반: 단어를 실제 페이지 가장자리(margin)에 안착.
 * 스크롤 잠금: body overflow:hidden + lenisRef.current?.stop().
 * 접근성: aria-hidden(장식). 금기: WebGL·히어로 안무·About·statement 수정 금지.
 */

import { useEffect, useRef, useState } from 'react'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useLenis } from '@/lib/hooks/useLenis'

export function Intro() {
  const [visible, setVisible] = useState(true)

  const topRef    = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lineRef   = useRef<HTMLDivElement>(null)
  const nameRef   = useRef<HTMLParagraphElement>(null)
  const parkRef   = useRef<HTMLSpanElement>(null)
  const minjooRef = useRef<HTMLSpanElement>(null)

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile  = window.matchMedia('(max-width: 767px)').matches

    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    lenisRef.current?.stop()

    const unlock = () => {
      document.body.style.overflow = ''
      window.scrollTo(0, 0)
      lenisRef.current?.start()
    }

    const topEl    = topRef.current
    const bottomEl = bottomRef.current
    const lineEl   = lineRef.current
    const parkEl   = parkRef.current
    const minjooEl = minjooRef.current
    const nameEl   = nameRef.current

    if (!topEl || !bottomEl || !lineEl || !parkEl || !minjooEl || !nameEl) {
      unlock()
      return
    }

    if (isReduced) {
      const id = window.setTimeout(() => {
        setVisible(false)
        unlock()
      }, 500)
      return () => {
        clearTimeout(id)
        unlock()
      }
    }

    registerGsap()
    gsap.set(lineEl, { opacity: 0 })
    gsap.set(nameEl, { opacity: 0, y: 0 })

    const margin = isMobile ? 14 : 28        // 페이지 가장자리 여백 (px)
    const minDur = isMobile ? 2.0 : 2.4      // 텍스트가 끝에 닿는 시점 ≈ 오버레이 개방 (느리게)

    let tl: gsap.core.Timeline | null = null

    // 선을 *두 단어 사이 틈*에만: 매 프레임 단어 rect 로 left/width 갱신 (글자 위 안 지나감)
    const updateLine = () => {
      const parkRight = parkEl.getBoundingClientRect().right
      const minjooLeft = minjooEl.getBoundingClientRect().left
      const gap = Math.max(0, minjooLeft - parkRight)
      lineEl.style.left  = `${parkRight}px`
      lineEl.style.width = `${gap}px`
    }

    document.fonts.ready.then(() => {
      lenisRef.current?.stop()

      // 단어가 가야 할 가장자리 목표
      const parkRect   = parkEl.getBoundingClientRect()
      const minjooRect = minjooEl.getBoundingClientRect()
      const nameRect   = nameEl.getBoundingClientRect()

      const parkTargetX   = margin - parkRect.left                          // PARK 좌단 → 페이지 좌끝
      const minjooTargetX = (window.innerWidth - margin) - minjooRect.right // MINJOO 우단 → 페이지 우끝

      // 선 수직 위치 = 텍스트 정중앙(틈이라 글자와 안 겹침)
      lineEl.style.top = `${nameRect.top + nameRect.height / 2}px`
      updateLine()

      tl = gsap.timeline()

      // ① 이름 등장 (0 → 0.7s)
      tl.fromTo(
        nameEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      )

      // ② 좌우 분열 — 페이지 양끝까지. 선은 onUpdate 로 틈만 추적. (t=1.0)
      tl.to(parkEl,   { x: parkTargetX,   ease: 'power3.out', duration: 1.4, onUpdate: updateLine }, 1.0)
      tl.to(minjooEl, { x: minjooTargetX, ease: 'power3.out', duration: 1.4, onUpdate: updateLine }, 1.0)
      tl.to(lineEl,   { opacity: 1, duration: 0.5 }, 1.05) // 틈이 열리며 선 페이드인

      // ③ 텍스트가 끝에 닿으면 — 상·하 오버레이가 가로선 따라 열림 (t=minDur)
      tl.to(topEl,            { yPercent: -100, ease: 'power3.inOut', duration: 1.0 }, minDur)
      tl.to(bottomEl,         { yPercent:  100, ease: 'power3.inOut', duration: 1.0 }, minDur)
      tl.to([nameEl, lineEl], { opacity: 0, duration: 0.45 },                          minDur)

      // ④ 완료 — 언마운트 + 스크롤 해제 (minDur + 1.1)
      tl.add(() => {
        setVisible(false)
        unlock()
      }, minDur + 1.1)
    })

    return () => {
      tl?.kill()
      unlock()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div aria-hidden="true" className="fixed inset-0 z-[60]">
      {/* ── 상단 오버레이 패널 ── */}
      <div
        ref={topRef}
        className="fixed top-0 left-0 w-full bg-hero-bg"
        style={{ height: '50vh' }}
      />

      {/* ── 하단 오버레이 패널 ── */}
      <div
        ref={bottomRef}
        className="fixed bottom-0 left-0 w-full bg-hero-bg"
        style={{ height: '50vh' }}
      />

      {/* ── 가로선 — 두 단어 사이 *틈* 에만. left/width 는 JS(updateLine)가 매 프레임 설정. ── */}
      <div
        ref={lineRef}
        className="fixed bg-ink-primary"
        style={{
          top: '50vh',
          left: '50vw',
          width: '0px',
          height: '1px',
          opacity: 0,
        }}
      />

      {/* ── 이름 — 얇게(font-normal). centering wrapper + 내부 <p>(GSAP). ── */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <p
          ref={nameRef}
          className="font-sans font-normal text-ink-primary select-none flex gap-[0.6em] whitespace-nowrap"
          style={{
            fontSize: 'clamp(26px, 3.4vw, 38px)',
            letterSpacing: '0.16em',
            opacity: 0,
          }}
        >
          <span ref={parkRef}>PARK</span>
          <span ref={minjooRef}>MINJOO</span>
        </p>
      </div>
    </div>
  )
}

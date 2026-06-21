'use client'

/**
 * Intro — 미니멀 로더 (mantis.works 모션 레퍼런스, CEO 지정 2026-06-18).
 *
 * 모션:
 *   - 화면 중앙 풀폭 연한 가로선(1px, ink/20).
 *   - % 텍스트(모노)가 선 위를 **왼→오로 이동** (위치 = 진행률). fill 아님 — 텍스트 이동.
 *   - 로딩 도중 ~18% 에서 살짝 멈칫했다가 다시 로딩(실제 로더 느낌).
 *   - 선 아래 좌측: 이름(세미볼드, 절제) + 작은 설명(모노).
 *   - 100% → 페이드로 Hero 진입.
 *
 * 헌법: CSS/GSAP, quiet luxury. 스크롤 잠금은 onComplete + 안전 타임아웃으로 해제.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useLenis } from '@/lib/hooks/useLenis'

// module-level cache — StrictMode double-mount 사이에 sessionStorage 가 비어도
// 같은 postNav 값을 두 번째 mount 에 전달하기 위함
let _consumedPostNav: { scrollId: string | null; cardSlug: string | null } | null = null
let _consumedAt = 0

export function Intro() {
  // mount 첫 render 시 sessionStorage 즉시 consume → module cache 저장
  // StrictMode 의 두 번째 mount 는 cache 사용 (3초 내)
  const postNavInitial = useMemo(() => {
    if (typeof window === 'undefined') return { scrollId: null as string | null, cardSlug: null as string | null }
    const sid = sessionStorage.getItem('postNavScrollId')
    const csl = sessionStorage.getItem('postNavCardSlug')
    if (sid || csl) {
      _consumedPostNav = { scrollId: sid, cardSlug: csl }
      _consumedAt = Date.now()
      try {
        sessionStorage.removeItem('postNavScrollId')
        // postNavCardSlug 는 HeroSticky 가 별도로 consume → 여기서 안 건드림
      } catch {}
      return { scrollId: sid, cardSlug: csl }
    }
    if (_consumedPostNav && Date.now() - _consumedAt < 3000) {
      return _consumedPostNav
    }
    return { scrollId: null, cardSlug: null }
  }, [])
  const [visible, setVisible] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // postNav 진입 (Back 으로 / 진입) — Intro 가 화면 가린 채 scrollTo 완료까지 유지
    // → Hero 안 보임. element 마운트 + scrollTo 후 페이드아웃.
    const postNavScrollId = postNavInitial.scrollId
    const postNavCardSlug = postNavInitial.cardSlug
    if (postNavScrollId || postNavCardSlug) {
      // body overflow lock — Hero 노출 차단
      document.body.style.overflow = 'hidden'

      let cancelled = false
      let attempts = 0
      const settle = () => {
        if (cancelled) return
        if (postNavScrollId) {
          const el = document.getElementById(postNavScrollId)
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY
            // 1) 즉시 native scroll 점프 (Lenis 없어도 작동)
            window.scrollTo({ top, left: 0, behavior: 'instant' as ScrollBehavior })
            // 2) Lenis 가 있으면 internal _scroll 도 동기
            const lenis = lenisRef.current
            if (lenis) {
              lenis.scrollTo(top, {
                immediate: true,
                force: true,
                lock: true,
                duration: 0,
              })
            }
            // 2 frame 후 Intro 페이드아웃 + unlock
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                if (!cancelled) {
                  setVisible(false)
                  document.body.style.overflow = ''
                }
              })
            )
            return
          }
        } else {
          setVisible(false)
          document.body.style.overflow = ''
          return
        }
        attempts++
        if (attempts < 120) requestAnimationFrame(settle)
        else {
          setVisible(false)
          document.body.style.overflow = ''
        }
      }
      requestAnimationFrame(settle)
      return () => {
        cancelled = true
        document.body.style.overflow = ''
      }
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    lenisRef.current?.stop()

    // window-level wheel/touchmove/keydown 직접 차단 — Lenis ref 가 mount 시점 null 일 수도 있어
    // body overflow + lenis.stop() 만으론 부족. wheel 자체를 preventDefault.
    const blockScroll = (e: Event) => {
      e.preventDefault()
    }
    const blockKeys = (e: KeyboardEvent) => {
      // PageDown/Up, Space, Arrow keys 차단
      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
      if (keys.includes(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', blockScroll, { passive: false })
    window.addEventListener('touchmove', blockScroll, { passive: false })
    window.addEventListener('keydown', blockKeys)

    const unlock = () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      window.scrollTo(0, 0)
      lenisRef.current?.start()
      window.removeEventListener('wheel', blockScroll)
      window.removeEventListener('touchmove', blockScroll)
      window.removeEventListener('keydown', blockKeys)
    }

    if (reduced) {
      const id = window.setTimeout(() => {
        setVisible(false)
        unlock()
      }, 300)
      return () => {
        clearTimeout(id)
        unlock()
      }
    }

    const cont = containerRef.current
    const group = groupRef.current
    const marker = markerRef.current
    const pct = pctRef.current
    if (!cont || !group || !marker || !pct) {
      unlock()
      return
    }

    registerGsap()
    gsap.set(group, { opacity: 0 })

    const prog = { p: 0 }
    const update = () => {
      pct.textContent = String(Math.round(prog.p))
      // 숫자가 선을 끝까지(우측 끝) 타고 감 — 100% 면 left 100%(선 우측 끝).
      marker.style.left = `${prog.p}%`
    }

    const finish = () => {
      setVisible(false)
      unlock()
    }
    const safety = window.setTimeout(finish, 3500)

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safety)
        finish()
      },
    })

    // ① 선·이름 등장
    tl.to(group, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)

    // ② % 텍스트가 선 위를 왼→오 이동 — ~18% 에서 살짝 멈칫 후 다시 로딩 (압축)
    tl.to(prog, { p: 18, duration: 0.35, ease: 'power1.out', onUpdate: update }, 0.5)
    tl.to(prog, { p: 23, duration: 0.4, ease: 'sine.inOut', onUpdate: update }, '>')
    tl.to(prog, { p: 100, duration: 1.3, ease: 'power1.inOut', onUpdate: update }, '>')

    // ③ 100% → 짧게 머문 뒤 페이드로 Hero 진입
    tl.to(cont, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '>+0.2')

    return () => {
      clearTimeout(safety)
      tl.kill()
      unlock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div ref={containerRef} aria-hidden="true" className="fixed inset-0 z-[110] bg-hero-bg">
      {/* 화면 중앙에 로더(선 + 이동 % + 이름) 배치 */}
      <div
        ref={groupRef}
        className="absolute inset-x-side-m md:inset-x-side-t xl:inset-x-side-d top-1/2 -translate-y-1/2"
      >
        {/* 풀폭 가로선 + 선 위를 타고 이동하는 % (숫자 배경이 선을 끊어 "선상에 올라탄" 모양) */}
        <div className="relative h-px w-full bg-ink-primary/20">
          <div
            ref={markerRef}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-hero-bg px-2.5 font-mono text-[11px] leading-none tracking-[0.04em] text-ink-primary"
            style={{ left: '0%' }}
          >
            <span ref={pctRef}>0</span>%
          </div>
        </div>

        {/* 선 아래 좌측: 이름 + 작은 설명 (절제·세미볼드) */}
        <div className="mt-5 flex items-end gap-2.5">
          <span
            className="font-sans font-semibold text-ink-primary select-none"
            style={{ fontSize: 'clamp(20px, 2.2vw, 30px)', letterSpacing: '-0.01em' }}
          >
            PARK MINJOO
          </span>
          <span className="font-mono text-[9px] uppercase leading-[1.35] tracking-[0.1em] text-ink-muted pb-[6px]">
            UX/UI
            <br />
            DESIGNER
          </span>
        </div>
      </div>
    </div>
  )
}

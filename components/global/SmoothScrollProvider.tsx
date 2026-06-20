'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { useReducedMotionContext } from './ReducedMotionProvider'
import { useScrollRefresh } from '@/lib/hooks/useScrollRefresh'
import { LenisContext } from '@/lib/hooks/useLenis'

/**
 * Lenis + GSAP ticker 단일 라이프사이클.
 * 4차 §4.2, §7.5
 *
 * reduced-motion: lenis는 인스턴스화하되 smoothWheel=false 로 네이티브 스크롤 우선.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionContext()
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null)

  useScrollRefresh()

  // 라우트 전환 시 sessionStorage 의 스크롤 의도 + URL hash 양쪽 확인.
  //
  // sessionStorage 방식 (`postNavScrollId`) = WorkViewer 의 Back 버튼이 명시적으로 세팅.
  // URL hash 방식 = 일반 in-page 앵커 (nav WORK 클릭 등).
  //
  // 라우트 전환 직후 Lenis 가 내부 스크롤을 0 으로 sync 하므로:
  // - 400ms 초기 딜레이
  // - RAF 폴링으로 섹션 element 마운트 대기
  // - 첫 scrollTo 후 200ms 뒤 재호출 (Lenis sync 가 덮어써도 다시 보강)
  // - force:true 로 stopped/lock 상태 무시
  useEffect(() => {
    if (!lenisInstance) return
    if (typeof window === 'undefined') return

    function doScrollTo(id: string) {
      const el = document.getElementById(id)
      if (!el || !lenisInstance) return false
      const top = el.getBoundingClientRect().top + window.scrollY
      // postNav 진입 시 Hero 잠깐 보이는 거 회피 → 즉시 점프 (Lenis immediate)
      // sessionStorage 의 postNavScrollId 가 있을 때만 immediate, 일반 hash 는 smooth
      const isPostNav = id.startsWith('work-')
      lenisInstance.scrollTo(top, {
        offset: 0,
        duration: isPostNav ? 0 : 1.2,
        lock: true,
        force: true,
        immediate: isPostNav,
      })
      return true
    }

    function scrollToTarget(id: string) {
      let attempts = 0
      const tryScroll = () => {
        if (doScrollTo(id)) {
          // Lenis 가 다음 tick 에 0 으로 reset 할 수 있어 보강
          setTimeout(() => doScrollTo(id), 200)
          setTimeout(() => doScrollTo(id), 600)
          return
        }
        if (attempts < 60) {
          attempts++
          requestAnimationFrame(tryScroll)
        }
      }
      // postNav 진입은 즉시 시작 (Hero 노출 회피)
      const initialDelay = id.startsWith('work-') ? 0 : 400
      setTimeout(tryScroll, initialDelay)
    }

    // 1) sessionStorage 의 명시적 스크롤 의도 (Back 버튼 경로)
    const storedId = sessionStorage.getItem('postNavScrollId')
    if (storedId) {
      sessionStorage.removeItem('postNavScrollId')
      scrollToTarget(storedId)
      return
    }

    // 2) URL hash 경로
    function scrollToHash() {
      const hash = window.location.hash
      if (!hash) return
      scrollToTarget(hash.slice(1))
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [lenisInstance, pathname])

  useEffect(() => {
    registerGsap()

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: false,
      // iframe / data-lenis-prevent element 안 wheel 차단 (StudyDrawer iframe 등)
      prevent: (node: Element) =>
        node.hasAttribute('data-lenis-prevent') ||
        node.tagName === 'IFRAME' ||
        !!node.closest('[data-lenis-prevent]'),
    })
    lenisRef.current = lenis
    setLenisInstance(lenis)

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    // GSAP ticker는 초(seconds) 단위, Lenis raf()는 ms 단위 → * 1000 변환 정확
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
      setLenisInstance(null)
    }
  }, [reduced])

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  )
}

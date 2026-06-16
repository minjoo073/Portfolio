'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const lenisRef = useRef<Lenis | null>(null)
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null)

  useScrollRefresh()

  useEffect(() => {
    registerGsap()

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: false
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

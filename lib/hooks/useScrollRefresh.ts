'use client'

import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * 리사이즈 시 ScrollTrigger.refresh() — debounce 250ms.
 * 4차 개발 구조 7.5절.
 */
export function useScrollRefresh() {
  useEffect(() => {
    let timer: number
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 250)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(timer)
    }
  }, [])
}

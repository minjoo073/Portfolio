'use client'

import { useEffect, useState } from 'react'

/**
 * `prefers-reduced-motion: reduce` 환경 감지.
 * 3차 인터랙션 헌법 5조 — 모든 모션은 이 값을 확인해야 한다.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])

  return reduced
}

'use client'

import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

/**
 * SmoothScrollProvider가 주입하는 Lenis 인스턴스 context.
 * SmoothScrollProvider.tsx에서 Provider 값으로 사용.
 *
 * @example
 * const lenis = useLenis()
 * lenis?.scrollTo('#about', { duration: 1.2 })
 */
export const LenisContext = createContext<Lenis | null>(null)

/**
 * 현재 Lenis 인스턴스를 반환.
 * SmoothScrollProvider 밖에서 호출하면 null.
 * Lenis 초기화 전(SSR·첫 렌더) 에도 null — 호출부에서 null 가드 필요.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

'use client'

import { useEffect, useRef, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'

/**
 * gsap.context() cleanup을 useEffect로 감싸는 훅.
 * React 18 Strict Mode 이중실행 방지 — cleanup에서 ctx.revert() 호출.
 * 4차 §4.1 설계 원칙 4번 구현체.
 *
 * @param fn    - gsap.context에 전달할 animation 정의 함수
 * @param scope - scope Element ref (내부 셀렉터를 제한할 루트)
 * @param deps  - useEffect 의존성 배열
 *
 * @example
 * const root = useRef<HTMLDivElement>(null)
 * useGsapContext((ctx) => {
 *   gsap.from('[data-card]', { opacity: 0, y: 30 })
 * }, root, [])
 */
export function useGsapContext(
  fn: (context: gsap.Context) => (() => void) | void,
  scope?: RefObject<Element | null>,
  deps: DependencyList = []
): RefObject<gsap.Context | null> {
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    let extraCleanup: (() => void) | void

    const ctx = gsap.context((self) => {
      extraCleanup = fn(self)
    }, scope?.current ?? undefined)
    ctxRef.current = ctx

    return () => {
      extraCleanup?.()
      ctx.revert()
      ctxRef.current = null
    }
    // 의존성은 호출부에서 관리 — exhaustive-deps 경고 억제
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ctxRef
}

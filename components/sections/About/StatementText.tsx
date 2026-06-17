'use client'

/**
 * StatementText — About 섹션 거대 영문 statement 단어 퍼짐 효과.
 *
 * 동작 (left → justify 간격 보간):
 *   - 초기: 각 줄의 단어들이 왼쪽 정렬 + 타이트 띄어쓰기 (모든 단어 또렷이 읽힘)
 *   - 스크롤: 단어 사이 간격(띄어쓰기)이 점점 벌어짐
 *   - 끝: 완전 justify — 각 줄이 좌우 폭을 꽉 채움 (마지막 줄 좌측정렬 유지)
 *
 * 알고리즘 (두 레이아웃 측정):
 *   1. SplitText type:'words' → 단어 span 생성
 *   2. container textAlign='justify' → J_i = 각 단어 left (컨테이너 기준)
 *   3. container textAlign='left'   → L_i = 각 단어 left (컨테이너 기준)
 *   4. justify 복원 + 각 단어 초기 x = L_i - J_i (≤ 0: 좌측정렬 위치로 이동)
 *   5. ScrollTrigger scrub → x to 0 (justify 제자리)
 *   6. stagger 없음 — 동시 애니메이션만 단어 좌표 단조 증가 보장 (겹침 수학적 불가)
 *      증명: pos_i(p) = L_i + p*(J_i-L_i). L_i<L_j, J_i<J_j 이면 pos_i(p)<pos_j(p) 항상.
 *
 * 주의:
 *   - function 선언 대신 const 화살표 함수 (TS hoisting → 나로잉 소실 방지)
 *   - 리사이즈: debounce 200ms → revert + 재측정 + ScrollTrigger.refresh
 *   - reduced-motion: 효과 skip (justify 최종 상태 즉시 표시)
 */

import { useEffect, useRef } from 'react'
import { registerGsap, gsap, ScrollTrigger, SplitText } from '@/lib/gsap/config'

interface Props {
  text: string
}

export function StatementText({ text }: Props) {
  const elRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // reduced-motion: 최종(justify) 상태 즉시, 애니메이션 skip
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    registerGsap()

    let splitInstance: SplitText | null = null
    let resizeTimer: ReturnType<typeof setTimeout>

    const ctx = gsap.context(() => {
      // NOTE: const 화살표 함수 — hoisting 없어 TS 나로잉 유지 (function 선언 금지)
      const setup = () => {
        // 이전 ScrollTrigger 제거
        ScrollTrigger.getAll()
          .filter((st) => st.vars.trigger === el)
          .forEach((st) => st.kill())

        // 이전 SplitText 복원
        if (splitInstance) {
          splitInstance.revert()
          splitInstance = null
        }

        // 1. 단어 단위 분할
        splitInstance = new SplitText(el, { type: 'words' })
        const words = splitInstance.words
        if (!words.length) return

        // 측정 전 기존 transform 초기화 (이전 재실행 잔여 방지)
        gsap.set(words, { x: 0, y: 0 })

        // 컨테이너 기준 rect (text-align 변경 시 컨테이너 위치 불변 → 한 번만 측정)
        const containerRect = el.getBoundingClientRect()

        // 2. J_i 측정: justify 모드에서 각 단어 left 위치
        //    getBoundingClientRect() 호출 시 강제 레이아웃 → 즉시 측정값 반영
        el.style.textAlign = 'justify'
        el.style.textAlignLast = 'left'
        const jPositions = words.map(
          (w) => w.getBoundingClientRect().left - containerRect.left
        )

        // 3. L_i 측정: left-aligned 모드에서 각 단어 left 위치
        el.style.textAlign = 'left'
        const lPositions = words.map(
          (w) => w.getBoundingClientRect().left - containerRect.left
        )

        // 4. justify 모드 복원 + 각 단어 초기 위치 = 좌측정렬 위치
        //    x = L_i - J_i (줄 첫 단어 ≈ 0, 우측 단어일수록 더 음수)
        //    → 화면에서 단어가 좌측정렬 위치에 보임 (타이트, 모두 읽힘, 절대 겹침 없음)
        el.style.textAlign = 'justify'
        el.style.textAlignLast = 'left'
        words.forEach((w, i) => {
          gsap.set(w, { x: lPositions[i] - jPositions[i], force3D: true })
        })

        // 5. ScrollTrigger scrub: left-aligned → justify (x → 0)
        //    stagger 없음: 겹침 방지 (동시 애니메이션만 단조 순서 보장)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1.2,
          },
        })

        tl.to(words, {
          x: 0,
          ease: 'power2.inOut',
          duration: 1,
        })
      }

      setup()

      // 리사이즈: debounce 200ms → 재측정
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          setup()
          ScrollTrigger.refresh()
        }, 200)
      }
      window.addEventListener('resize', onResize, { passive: true })

      return () => {
        clearTimeout(resizeTimer)
        window.removeEventListener('resize', onResize)
        if (splitInstance) {
          splitInstance.revert()
          splitInstance = null
        }
      }
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <h2
      ref={elRef}
      className="font-display font-medium uppercase text-ink-inverse"
      style={{
        // 크기: clamp(22px, 2.8vw, 54px) — CEO 요청 "살짝 줄여서라도 여백"
        // 1440px: 40.3px / 1920px: 54px — justify 간격 효과 지각 가능 크기
        fontSize: 'clamp(22px, 2.8vw, 54px)',
        lineHeight: '1.12',
        letterSpacing: '-0.02em',
        textAlign: 'justify',
        textAlignLast: 'left',
      }}
      data-statement
    >
      {text}
    </h2>
  )
}

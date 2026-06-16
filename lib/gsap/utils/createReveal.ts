/**
 * 표준 텍스트 reveal 팩토리 — 4차 §4.4 1:1 구현.
 * 8섹션 모두 텍스트 reveal은 이 함수 1줄 호출로 통일.
 * SplitText + ScrollTrigger scrub 조합.
 */
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DURATION, EASE, STAGGER, SCRUB } from '../tokens'

type RevealOpts = {
  /** 분해 단위 — 기본값: 'lines' */
  by?: 'lines' | 'words'
  /** ScrollTrigger scrub 값 — true | 숫자 | false(즉시 실행) */
  scrub?: boolean | number
  /** ScrollTrigger start — 기본값: 'top 85%' */
  start?: string
  /** ScrollTrigger end — 기본값: 'top 50%' */
  end?: string
}

export function createReveal(target: Element, opts: RevealOpts = {}): gsap.core.Tween {
  const {
    by = 'lines',
    scrub = SCRUB.tight,
    start = 'top 85%',
    end = 'top 50%'
  } = opts

  const split = new SplitText(target, { type: by })
  const els = by === 'lines' ? split.lines : split.words

  return gsap.from(els, {
    y: 50,
    opacity: 0,
    clipPath: 'inset(100% 0 0 0)',
    duration: DURATION.enter,
    ease: EASE.enter,
    stagger: by === 'lines' ? STAGGER.line : STAGGER.word,
    scrollTrigger: {
      trigger: target,
      start,
      end,
      scrub
    }
  })
}

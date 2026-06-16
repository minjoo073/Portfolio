/**
 * 스크롤 parallax 팩토리.
 * 이미지·섹션 배경 요소에 수직 이동 효과 부여.
 * scrub 기반 — 스크롤과 1:1 연동.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCRUB } from '../tokens'

type ParallaxOpts = {
  /** 수직 이동량 (%) — 음수 = 위로, 기본값: -15 */
  yPercent?: number
  /** ScrollTrigger scrub 값 */
  scrub?: boolean | number
  /** ScrollTrigger start — 기본값: 'top bottom' */
  start?: string
  /** ScrollTrigger end — 기본값: 'bottom top' */
  end?: string
}

export function createParallax(target: Element, opts: ParallaxOpts = {}): gsap.core.Tween {
  const {
    yPercent = -15,
    scrub = SCRUB.loose,
    start = 'top bottom',
    end = 'bottom top'
  } = opts

  return gsap.to(target, {
    yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: target,
      start,
      end,
      scrub
    }
  })
}

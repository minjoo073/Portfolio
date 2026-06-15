/**
 * Motion tokens — 3차 인터랙션 설계 1.3절 1:1 코드화
 * 사이트 전체 톤 조정은 이 파일 수정으로 끝낸다.
 */

export const DURATION = {
  enter: 0.8,
  enterSoft: 1.2,
  exit: 0.6,
  hover: 0.3,
  hoverBack: 0.4
} as const

export const EASE = {
  enter: 'power3.out',
  exit: 'power2.inOut',
  hover: 'power2.out',
  paperFall: 'power2.in',
  paperLand: 'power2.out',
  scrub: 'none'
} as const

export const STAGGER = {
  line: 0.12,
  word: 0.06,
  item: 0.08,
  card: 0.2
} as const

export const SCRUB = {
  tight: 0.5,
  loose: 1,
  true: true as const
} as const

export const LERP = {
  cursor: 0.15
} as const

export const LOOP = {
  marqueeSlow: 30,
  marqueeFast: 20,
  bounceSec: 2
} as const

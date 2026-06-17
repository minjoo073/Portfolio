import type { NavLink } from '@/lib/types/nav'

/** 좌측 utility 라벨 — copyright */
export const navUtilityLeft = '© 2026 PARK MINJOO'

/** 중앙 brand 라벨 */
export const navUtilityCenter = 'PARK MINJOO — UX/UI DESIGNER'

export const navLinks: NavLink[] = [
  { label: 'WORK', href: '#work' },
  { label: 'CONTACT', href: '#contact' }
]

/**
 * Hero 마퀴 1행 — 좌행(left-ward) 스크롤
 * JSX 에서 두 번 spread([...row1, ...row1])해 seamless loop 구성.
 * 강개발이 GSAP translateX(0 → -50%) repeat:-1 로 구동.
 */
export const heroMarqueeRow1 = [
  'UX · UI DESIGN',
  'WEB PUBLISHING',
  'INTERACTION',
  'EDITORIAL',
  '(01)',
  'VISUAL IDENTITY',
  'CREATIVE CODE',
  'PROTOTYPE',
] as const

/**
 * Hero 마퀴 2행 — 우행(right-ward) 스크롤
 * JSX 에서 두 번 spread([...row2, ...row2])해 seamless loop 구성.
 * 강개발이 GSAP translateX(-50% → 0%) repeat:-1 로 구동.
 */
export const heroMarqueeRow2 = [
  'BRANDING',
  'MOTION DESIGN',
  'DIGITAL EXPERIENCE',
  'SEOUL KOREA',
  '(02)',
  'PORTFOLIO 2026',
  'PRODUCT DESIGN',
  'USER RESEARCH',
] as const

/** Hero 본문 paragraph — 2줄, 선언적 솔로 디자이너 톤 */
export const heroBody = [
  'PARK MINJOO IS A UX/UI DESIGNER & WEB PUBLISHER BASED IN SEOUL —',
  'CRAFTING INTERACTIVE DIGITAL EXPERIENCES WHERE DESIGN MEETS CODE.',
] as const

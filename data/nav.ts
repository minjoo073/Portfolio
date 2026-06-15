import type { NavLink } from '@/lib/types/nav'

/** 좌측 utility 라벨 — placeholder, 사용자 콘텐츠로 교체 가능 */
export const navUtilityLeft = '© 2026 PARK MINJOO'

/** 중앙 라벨 — 비워두거나 작은 brand 라벨 */
export const navUtilityCenter = ''

export const navLinks: NavLink[] = [
  { label: 'WORK', href: '#work' },
  { label: 'CONTACT', href: '#contact' }
]

/** Hero 키워드 spread — 8개, 가로로 균등 분산 배치 (placeholder) */
export const heroCategories = [
  { top: 'UX · UI', bottom: 'DESIGN' },
  { top: 'WEB', bottom: 'DEVELOPMENT' },
  { top: 'INTERACTION', bottom: 'MOTION' },
  { top: 'PUBLISHING', bottom: 'EDITORIAL' },
  { top: 'BRANDING', bottom: 'IDENTITY' },
  { top: 'VISUAL', bottom: 'CREATIVITY' },
  { top: 'PORTFOLIO', bottom: '2026' },
  { top: 'SEOUL', bottom: 'KOREA' }
] as const

/** Hero 본문 paragraph — placeholder */
export const heroBody = [
  'UX/UI DESIGNER AND WEB PUBLISHER BASED IN SEOUL,',
  'CRAFTING EDITORIAL VISUALS WITH INTERACTIVE WEB EXPERIENCES'
] as const

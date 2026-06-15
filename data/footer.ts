import type { FooterLink } from '@/lib/types/nav'

export const footer = {
  /** 구직 상태 라벨 — 채용 담당자에게 즉시 신호 */
  status: 'Available for design opportunities',

  /** 위치 */
  location: 'Seoul, Korea',

  /** 이메일 — 보통 사이즈로 노출 */
  email: 'hello@parkminjoo.com',

  /** 강조 행 — 신입 포폴 메인 CTA */
  resume: { label: 'Resume PDF', url: '/resume.pdf' },

  /** 보조 채널 */
  links: [
    { label: 'GitHub', url: 'https://github.com/minjoo073' },
    { label: 'Notion', url: 'https://notion.so/parkminjoo' }
  ] satisfies FooterLink[],

  copyright: '© 2026 Park Minjoo · Designed and built solo'
}

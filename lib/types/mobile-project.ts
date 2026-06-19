export interface MobileProject {
  id: string
  index: '01' | '02'
  title: string
  category: string
  /** 출시일 — 'May 2026' 형식. 미출시 시 undefined */
  releaseDate?: string
  platforms: ('iOS' | 'Android' | 'Web')[]
  downloadLinks: {
    playStore?: string
    appStore?: string
    /** 다운로드 없이 웹에서만 동작 (TripMate 등) */
    web?: string
  }
  stack?: string[]
  tagline: string
  description?: string
  /** 9:19.5 PNG/WebP placeholder 경로 */
  thumbnail: string
  /** 9:19.5 영상 (mp4/webm) — 있으면 video 자동 사용 */
  previewVideo?: string
  /** 제작과정 외부 URL — 없으면 CTA 미노출 */
  studyHref?: string
  displayType: 'featured' | 'side'
  comingSoon?: boolean
}

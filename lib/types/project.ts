export type ProjectType = 'web' | 'mobile'

/**
 * featured: 5개 (케이스스터디 있음, 두 진입점: View Site + View Case).
 * archive:  06/07 (케이스 없음, View Site 만 + 비주얼 brightness 다운).
 */
export type ProjectDisplayType = 'featured' | 'archive'

/**
 * original: 기획 + 브랜딩 + 디자인 전 과정 (01-03).
 * redesign: 기존 사이트 리디자인 (04-07).
 */
export type ProjectWorkType = 'original' | 'redesign'

export interface Project {
  id: string
  index: string
  type: ProjectType
  title: string
  date: string
  category: string
  thumbnail: string
  detailAnchor: string
  /** 케이스스터디 정적 경로 — /work/<slug> */
  studyHref?: string
  /** 라이브 사이트 URL — 7개 모두 (View Site 진입점) */
  siteHref?: string
  /** 좌 메타 패널 1줄 설명 */
  subline: string
  /** 카드 위계 — featured(큰 카드 두 진입점) / archive(brightness 다운 + 한 진입점) */
  displayType: ProjectDisplayType
  /** 작업 범위 — original(기획+브랜딩+디자인) / redesign(기존 사이트 리디자인) */
  workType: ProjectWorkType
  // Mobile 작품 전용 영상 필드
  /** mp4 영상 (H.264, Safari iOS 호환) */
  videoSrc?: string
  /** webm 영상 (VP9, 가벼움) — browser fallback 우선 시도 */
  videoWebmSrc?: string
  /** 영상 정적 첫 프레임 (CLS 방지 + loading fallback) */
  videoPoster?: string
  /** 비율 — 예: '390/844' (iPhone Pro), Mobile portrait 카드용 */
  aspectRatio?: string
  // 후속 단계: 상세 콘텐츠
  intent?: string
  research?: string
  ia?: string
  interaction?: string
  result?: string
}

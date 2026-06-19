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

/**
 * left:  워드마크·본문 좌측 / 비주얼 우측 (01·03·05 홀수)
 * right: 워드마크·본문 우측 / 비주얼 좌측 (02·04 짝수)
 */
export type ProjectVariant = 'left' | 'right'

/**
 * 16:10 — 기본 (featured 760×475)
 * 4:5   — 03 FANCIVE 전용 (비주얼 폭 동일 760, 높이 950)
 */
export type ProjectVisualRatio = '16:10' | '4:5'

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
  /** 라이브 사이트 URL — 실사이트 진입점 */
  siteHref?: string
  /** GitHub 저장소 URL — 깃허브 진입점 */
  githubHref?: string
  /** Cafe24 스킨 URL — 예: 01 LUNARE 커머스 스킨 */
  skinHref?: string
  /** 썸네일이 밝아 검정 배경에 떠 보일 때 한 톤 어둡게(예: MathHub) */
  dimThumb?: boolean
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

  // ── Bracket Ledger 카드 신규 필드 (2026-06-19) ─────────────────
  /** 제작 규모 — 예: '1인 제작', '팀 3인' */
  scale?: string
  /** 역할 배열 — 예: ['브랜드 IA', '랜딩 카피', '스킨 퍼블리싱'] */
  role?: string[]
  /** 기술 스택 배열 — 예: ['HTML', 'CSS', 'JavaScript'] */
  stack?: string[]
  /**
   * 본문 정렬 방향
   * left:  워드마크·본문 좌측 / 비주얼 우측 (01·03·05 기본)
   * right: 워드마크·본문 우측 / 비주얼 좌측 (02·04)
   */
  variant?: ProjectVariant
  /**
   * 비주얼 비율
   * '16:10' — 기본 featured (760×475)
   * '4:5'   — 03 FANCIVE 전용 (760×950)
   */
  visualRatio?: ProjectVisualRatio
  /** 워드마크 영문 텍스트 (PP Editorial 128px) — title 와 별도로 표기 가능 */
  wordmark?: string
  /** 한 줄 카피 (한국어, 22px 400) */
  tagline?: string
  /** 전체 카운터 최대값 (총 몇 개인지) */
  total?: string
}

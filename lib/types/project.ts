export type ProjectType = 'web' | 'mobile'

export interface Project {
  id: string
  index: string
  type: ProjectType
  title: string
  date: string
  category: string
  thumbnail: string
  detailAnchor: string
  /** 케이스스터디 정적 경로 — /projects/<slug>/study/ */
  studyHref?: string
  // 후속 단계: 상세 콘텐츠
  intent?: string
  research?: string
  ia?: string
  interaction?: string
  result?: string
}

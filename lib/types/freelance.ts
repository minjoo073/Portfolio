/**
 * 외주(CLIENT) 작업 — 메인에 섹션으로 노출하지 않고 CLIENT 네비 → 풀스크린 오버레이로만 보여줌.
 * 카페24 스킨 3 + 기업 웹 에이전시 리디자인 1 (총 4).
 * 콘텐츠는 우선 플레이스홀더 — thumbnail 미지정 시 모달이 회색 placeholder 렌더.
 */
export interface FreelanceItem {
  /** 표시 번호 — '01' ~ '04' */
  index: string
  /** 프로젝트 제목 */
  title: string
  /** 분류 — 예: 'Cafe24 스킨', '웹 에이전시 리디자인' */
  category: string
  /** 1~2줄 짧은 설명 */
  description: string
  /** 섬네일 경로 — 미지정 시 placeholder 박스 */
  thumbnail?: string
  /** 작업 연도 — 예: '2025' */
  year?: string
  /** 외부 링크(라이브 사이트) — 있으면 '↗' 노출 */
  href?: string
}

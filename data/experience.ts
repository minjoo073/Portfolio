/**
 * Experience & Activities — About ↔ Web Projects 사이 섹션.
 *
 * 2챕터: Marketing & Content / Design & Build.
 * SNS 세부는 data/content.ts 실데이터 기반.
 * TODO(CEO): 카페24 기간·링크 등 빈 항목 채우기.
 */
export interface ExperienceItem {
  period: string
  title: string
  details: string[]
}

export interface ExperienceGroup {
  category: string
  items: ExperienceItem[]
}

export const experienceGroups: ExperienceGroup[] = [
  {
    category: 'Marketing & Content',
    items: [
      {
        period: '2026.03 – 05',
        title: '개인 SNS 채널 운영 · @fancy._ju',
        details: [
          'UI/UX 학습 일상을 담은 스터디로그 채널 — 3개월 만에 80K 도달',
          '주 3–4회 발행 · 기획·촬영·편집 전 과정 1인 운영',
          '메디큐브 올리브영 · Ponder AI 등 브랜드 협업 제안 인바운드',
        ],
      },
      {
        period: '2026.05',
        title: '자린고비 앱 숏폼 콘텐츠 제작',
        details: [
          '앱 출시 캠페인 — 만드는 과정을 콘텐츠로 푼 빌드인퍼블릭 전략',
          '15초 티저 4편 + 메이킹 · Instagram(@4poor_project) · TikTok(@4poor6)',
          '기획·촬영·편집 1인 진행 (Premiere · CapCut)',
        ],
      },
      {
        period: '2024',
        title: '학과 SNS 채널 운영',
        details: [
          '재학 중 학과 공식 SNS 채널 기획·운영',
          '학과 소식·행사 콘텐츠 제작 및 도달 확대',
        ],
      },
    ],
  },
  {
    category: 'Design & Build',
    items: [
      {
        period: '2022 – 2024',
        title: '수학 메디컬 센터 · 보조강사 & 학습 콘텐츠 디자인',
        details: [
          '3년간 보조강사 근무 — 학습 관리·질의 응답',
          '학습 노트 디자인 참여 — 가독성·구조 중심 학습 자료 제작',
        ],
      },
      {
        period: '2025.12 – 2026.06',
        title: '주노소프트 · 카페24 커머스 스킨 제작',
        details: [
          '커머스 브랜드 스킨 직접 퍼블리싱 (HTML / CSS)',
          '반응형 레이아웃 · 브랜드 톤에 맞춘 UI 구현',
        ],
      },
      {
        period: '2026',
        title: 'AIAT 실무 활용 자격증 합격 예시 제작',
        details: [
          'Crowny AI · AIAT(AI 실무 활용 능력) 자격증 합격 사례 예시 파일 제작 지원',
          '실제 현업 사이드에서 활용 중인 합격 예시 자료로 사용',
        ],
      },
    ],
  },
]

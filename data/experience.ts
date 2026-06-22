/**
 * Experience & Activities — About 와 Web Projects 사이 섹션.
 *
 * ⚠️ 구조용 placeholder. CEO 가 실제 경험/활동으로 교체.
 *   - category: 그룹 라벨 (예: MARKETING & BRANDING)
 *   - items[]: 각 활동 — period(기간) · title(제목) · details(세부 bullet)
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
    category: 'Category One',
    items: [
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 1 (수정 예정)',
        details: ['세부 설명 줄 1', '세부 설명 줄 2'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 2 (수정 예정)',
        details: ['세부 설명 줄 1', '세부 설명 줄 2'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 3 (수정 예정)',
        details: ['세부 설명 줄 1'],
      },
    ],
  },
  {
    category: 'Category Two',
    items: [
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 4 (수정 예정)',
        details: ['세부 설명 줄 1', '세부 설명 줄 2'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 5 (수정 예정)',
        details: ['세부 설명 줄 1'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 6 (수정 예정)',
        details: ['세부 설명 줄 1', '세부 설명 줄 2'],
      },
    ],
  },
  {
    category: 'Category Three',
    items: [
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 7 (수정 예정)',
        details: ['세부 설명 줄 1'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 8 (수정 예정)',
        details: ['세부 설명 줄 1', '세부 설명 줄 2'],
      },
      {
        period: '2024.00 – 2024.00',
        title: '항목 제목 9 (수정 예정)',
        details: ['세부 설명 줄 1'],
      },
    ],
  },
]

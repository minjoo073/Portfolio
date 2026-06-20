export const about = {
  /** 거대 statement — 위쪽 영역 (그대로 유지) */
  statement: [
    'I DESIGN INTERFACES AND PUBLISH THEM ON THE WEB.',
    'BRIDGING DESIGN INTUITION WITH WORKING CODE,',
    'I BUILD INTERACTIVE EXPERIENCES',
    'THAT TRAVEL FROM IDEA TO PRODUCTION.'
  ] as const,
  body: [
    '디자인과 퍼블리싱 사이를 오가며,',
    '한 사람의 손으로 인터페이스가 완성되는 과정을 경험으로 만들어 갑니다.'
  ] as const,

  /** ─ AboutIndex 본문 (시안 4장 정확본) ─ */

  profile: {
    taglineLines: ['관찰하고,', '연결하는 디자이너'] as const,
    intro: [
      '좋은 경험은 거창한 아이디어보다 사람에 대한 작은 관찰에서 시작된다고 믿습니다.',
      '사용자의 시선이 머무는 곳, 자연스럽게 행동이 이어지는 흐름,\n그리고 오래 기억에 남는 순간을 고민합니다.',
      '작은 디테일이 모여 하나의 경험이 되고, 그 경험이 누군가에게 의미로 남을 수 있도록\n끊임없이 탐구하는 디자이너가 되고자 합니다.'
    ] as const
  },

  /** 1) About — 기본정보 */
  basicInfo: {
    birth: '2000 . 07 . 31',
    name: '박민주 Min Joo Park',
    phone: '+82 10-9234-0386',
    email: 'minju7731@naver.com'
  },

  /** 2) Education — 학력사항 */
  education: [
    { name: '호서대학교 중국학과', status: '졸업' },
    { name: '분당대진고등학교', status: '졸업' }
  ] as const,

  /** 3) Certificate — 자격증 (issuer/date 둘 다 옵션) */
  certificates: [
    { name: 'HSK 4급', issuer: 'HSK 한국사무국', date: '2025.04' },
    { name: '데이터 분석 준전문가(ADsP)', issuer: '한국데이터산업진흥원', date: '2026.03' },
    { name: '토익스피킹', issuer: 'ETS', date: '2026.06' },
    { name: 'GA4', issuer: '구글(Google)', date: '2026.04' },
    { name: '운전면허 2종 보통' }
  ] as ReadonlyArray<{ name: string; issuer?: string; date?: string }>,

  /** 4) Skills — 사용 프로그램 (외부 컬럼 좁아져서 Tools 단일 컬럼) */
  skills: {
    Design: ['Figma', 'Photoshop', 'Illustrator'] as const,
    Frontend: ['HTML', 'CSS', 'JavaScript'] as const,
    Tools: ['GSAP', 'Git', 'GitHub', 'VS Code', 'Notion', 'CapCut'] as const
  }
}

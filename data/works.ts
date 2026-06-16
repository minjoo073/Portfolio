/**
 * 케이스스터디 뷰어 (/work/<slug>) 라우트 데이터.
 * 순서: lunare → fancive → lp → buja → mathhub (mathhub = 마지막, next 없음).
 *
 * slug      : /work/<slug> URL
 * label     : NEXT 오버레이에 표시할 이름
 * iframeSrc : iframe이 로드할 static study 경로 (next.config.mjs rewrite 경유)
 * year      : 작업 연도 (NEXT 오버레이 메타)
 * role      : 담당 역할 (NEXT 오버레이 메타)
 * tagline   : 한 줄 카피 (NEXT 오버레이 메타)
 */
export interface Work {
  slug: string
  label: string
  iframeSrc: string
  year: string
  role: string
  tagline: string
}

export const works: Work[] = [
  {
    slug: 'lunare',  label: 'LUNARE',   iframeSrc: '/projects/lunare/study/',
    year: '2025', role: 'Brand Identity',
    tagline: '달의 광휘를 차용한 코스메틱 브랜딩 + 커머스',
  },
  {
    slug: 'fancive', label: 'FANCIVE',  iframeSrc: '/projects/fancive/study/',
    year: '2025', role: 'Editorial Archive',
    tagline: '매거진 형식의 패션 아카이브 웹',
  },
  {
    slug: 'lp',      label: 'ONVINYL',  iframeSrc: '/projects/lp/study/',
    year: '2025', role: 'Brand Identity',
    tagline: '바이닐 굿즈 브랜드 커머스 사이트',
  },
  {
    slug: 'buja',    label: '부자관광', iframeSrc: '/projects/buja/study/',
    year: '2025', role: 'Responsive Publishing',
    tagline: '부자관광 리브랜딩 + 반응형 퍼블리싱',
  },
  {
    slug: 'mathhub', label: 'MATHHUB',  iframeSrc: '/projects/mathhub/study/',
    year: '2025', role: 'UX / UI Design',
    tagline: '수학 학습 플랫폼 인터랙션 설계',
  },
]

export function getWork(slug: string): Work | undefined {
  return works.find(w => w.slug === slug)
}

/** slug 다음 작업 반환. mathhub(마지막)이면 undefined. */
export function getNextWork(slug: string): Work | undefined {
  const idx = works.findIndex(w => w.slug === slug)
  if (idx === -1 || idx === works.length - 1) return undefined
  return works[idx + 1]
}

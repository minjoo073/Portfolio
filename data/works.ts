/**
 * 케이스스터디 뷰어 (/work/<slug>) 라우트 데이터.
 * 순서: lunare → fancive → lp → buja → mathhub (mathhub = 마지막, next 없음).
 *
 * slug        : /work/<slug> URL
 * label       : NEXT 오버레이에 표시할 이름
 * iframeSrc   : iframe이 로드할 static study 경로 (next.config.mjs rewrite 경유)
 */
export interface Work {
  slug: string
  label: string
  iframeSrc: string
}

export const works: Work[] = [
  { slug: 'lunare',  label: 'LUNARE',   iframeSrc: '/projects/lunare/study/'  },
  { slug: 'fancive', label: 'FANCIVE',  iframeSrc: '/projects/fancive/study/' },
  { slug: 'lp',      label: 'ONVINYL',  iframeSrc: '/projects/lp/study/'      },
  { slug: 'buja',    label: '부자관광', iframeSrc: '/projects/buja/study/'    },
  { slug: 'mathhub', label: 'MATHHUB',  iframeSrc: '/projects/mathhub/study/' },
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

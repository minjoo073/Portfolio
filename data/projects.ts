import type { Project } from '@/lib/types/project'

/**
 * Web Projects — 7개
 *
 * 순서 (CEO 결정 2026-06-16):
 *   01 LUNARE   (Original — 기획+브랜딩+디자인) → /work/lunare
 *   02 ONVINYL  (Original)                     → /work/lp
 *   03 FANCIVE  (Original)                     → /work/fancive
 *   04 부자관광 (Redesign — 기존 사이트 개선)   → /work/buja
 *   05 MathHub  (Redesign)                     → /work/mathhub
 *   06 Project 06 (Redesign, archive — 케이스 없음)
 *   07 Project 07 (Redesign, archive)
 *
 * thumbnail: public/images/projects/<idx>/thumbnail.webp (1920×1080 hero 캡처)
 */
export const projects: Project[] = [
  {
    id: 'project01',
    index: '01',
    type: 'web',
    title: 'LUNARE',
    date: 'Jun 2026',
    category: 'Brand · UX/UI Web',
    subline: '달의 광휘를 차용한 코스메틱 브랜딩 + 커머스',
    thumbnail: '/images/projects/01/thumbnail.webp',
    detailAnchor: '#project01',
    displayType: 'featured',
    workType: 'original',
    studyHref: '/work/lunare',
    siteHref: 'https://minjoo073.github.io/LUNARE/',
  },
  {
    id: 'project02',
    index: '02',
    type: 'web',
    title: 'ONVINYL',
    date: 'Mar 2026',
    category: 'Brand · UX/UI Web',
    subline: '바이닐 굿즈 브랜드 커머스 사이트',
    thumbnail: '/images/projects/02/thumbnail.webp',
    detailAnchor: '#project02',
    displayType: 'featured',
    workType: 'original',
    studyHref: '/work/lp',
    siteHref: 'https://minjoo073.github.io/lp_2/',
  },
  {
    id: 'project03',
    index: '03',
    type: 'web',
    title: 'FANCIVE',
    date: 'May 2026',
    category: 'Brand · UX/UI · Front-end',
    subline: '매거진 형식의 패션 아카이브 웹',
    thumbnail: '/images/projects/03/thumbnail.webp',
    detailAnchor: '#project03',
    displayType: 'featured',
    workType: 'original',
    studyHref: '/work/fancive',
    siteHref: 'https://minjoo073.github.io/FANCIVE/',
  },
  {
    id: 'project04',
    index: '04',
    type: 'web',
    title: '부자관광',
    date: 'Jan 2026',
    category: 'UX/UI Web · Redesign',
    subline: '부자관광 리브랜딩 + 반응형 퍼블리싱',
    thumbnail: '/images/projects/04/thumbnail.webp',
    detailAnchor: '#project04',
    displayType: 'featured',
    workType: 'redesign',
    studyHref: '/work/buja',
    siteHref: 'https://minjoo073.github.io/redesign/',
  },
  {
    id: 'project05',
    index: '05',
    type: 'web',
    title: 'MathHub',
    date: 'Nov 2025',
    category: 'UX/UI · Product Design',
    subline: '수학 학습 플랫폼 인터랙션 설계',
    thumbnail: '/images/projects/05/thumbnail.webp',
    detailAnchor: '#project05',
    displayType: 'featured',
    workType: 'redesign',
    studyHref: '/work/mathhub',
    siteHref: 'https://jiwon12011.github.io/mathhub/',
  },
  {
    id: 'project06',
    index: '06',
    type: 'web',
    title: 'Project 06',
    date: 'Sep 2025',
    category: 'UX/UI Web',
    subline: '한 줄 설명 (CEO 입력 예정)',
    thumbnail: '/images/projects/06/thumbnail.webp',
    detailAnchor: '#project06',
    displayType: 'archive',
    workType: 'redesign',
  },
  {
    id: 'project07',
    index: '07',
    type: 'web',
    title: 'Project 07',
    date: 'Jul 2025',
    category: 'UX/UI Web',
    subline: '한 줄 설명 (CEO 입력 예정)',
    thumbnail: '/images/projects/07/thumbnail.webp',
    detailAnchor: '#project07',
    displayType: 'archive',
    workType: 'redesign',
  },
]

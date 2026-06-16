import type { Project } from '@/lib/types/project'

/**
 * Web Projects — 7개
 * 추가 방법: 객체 1개 push 하면 메인 + /projects 자동 확장.
 * 자세한 절차는 docs/04_Development.md §6 참조.
 *
 * studyHref 매핑 (작업 C, 2026-06-16):
 *   01 LUNARE   → public/projects/lunare/study/  (Vite 빌드, 상대경로 base=./)
 *   02 FANCIVE  → public/projects/fancive/study/ (Next.js export + 경로 패치)
 *   03 ONVINYL  → public/projects/lp/study/      (바닐라 HTML 그대로)
 *   04 부자관광  → public/projects/buja/study/    (standalone HTML + assets/)
 *   05 MathHub  → public/projects/mathhub/study/ (바닐라 HTML 그대로)
 *   06–07       → studyHref 없음 (레포 미확보, "Coming soon")
 */
export const projects: Project[] = [
  {
    id: 'project01',
    index: '01',
    type: 'web',
    title: 'LUNARE',
    date: 'Jun 2026',
    category: 'Brand · UX/UI Web',
    thumbnail: '/images/projects/01/thumbnail.webp',
    detailAnchor: '#project01',
    studyHref: '/work/lunare'
  },
  {
    id: 'project02',
    index: '02',
    type: 'web',
    title: 'FANCIVE',
    date: 'May 2026',
    category: 'Brand · UX/UI · Front-end',
    thumbnail: '/images/projects/02/thumbnail.webp',
    detailAnchor: '#project02',
    studyHref: '/work/fancive'
  },
  {
    id: 'project03',
    index: '03',
    type: 'web',
    title: 'ONVINYL',
    date: 'Mar 2026',
    category: 'UX/UI Web',
    thumbnail: '/images/projects/03/thumbnail.webp',
    detailAnchor: '#project03',
    studyHref: '/work/lp'
  },
  {
    id: 'project04',
    index: '04',
    type: 'web',
    title: '부자관광',
    date: 'Jan 2026',
    category: 'UX/UI Web · Redesign',
    thumbnail: '/images/projects/04/thumbnail.webp',
    detailAnchor: '#project04',
    studyHref: '/work/buja'
  },
  {
    id: 'project05',
    index: '05',
    type: 'web',
    title: 'MathHub',
    date: 'Nov 2025',
    category: 'UX/UI · Product Design',
    thumbnail: '/images/projects/05/thumbnail.webp',
    detailAnchor: '#project05',
    studyHref: '/work/mathhub'
  },
  {
    id: 'project06',
    index: '06',
    type: 'web',
    title: 'Project 06',
    date: 'Sep 2025',
    category: 'UX/UI Web',
    thumbnail: '/images/projects/06/thumbnail.webp',
    detailAnchor: '#project06'
    // studyHref: 레포 미확보
  },
  {
    id: 'project07',
    index: '07',
    type: 'web',
    title: 'Project 07',
    date: 'Jul 2025',
    category: 'UX/UI Web',
    thumbnail: '/images/projects/07/thumbnail.webp',
    detailAnchor: '#project07'
    // studyHref: 레포 미확보
  }
]

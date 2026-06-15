import type { Project } from '@/lib/types/project'

/**
 * Web Projects — 7개 (placeholder)
 * 추가 방법: 객체 1개 push 하면 메인 + /projects 자동 확장.
 * 자세한 절차는 docs/04_Development.md §6 참조.
 */
export const projects: Project[] = [
  {
    id: 'project01',
    index: '01',
    type: 'web',
    title: 'Project 01',
    date: 'Nov 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/01/thumbnail.webp',
    detailAnchor: '#project01'
  },
  {
    id: 'project02',
    index: '02',
    type: 'web',
    title: 'Project 02',
    date: 'Sep 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/02/thumbnail.webp',
    detailAnchor: '#project02'
  },
  {
    id: 'project03',
    index: '03',
    type: 'web',
    title: 'Project 03',
    date: 'Jul 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/03/thumbnail.webp',
    detailAnchor: '#project03'
  },
  {
    id: 'project04',
    index: '04',
    type: 'web',
    title: 'Project 04',
    date: 'May 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/04/thumbnail.webp',
    detailAnchor: '#project04'
  },
  {
    id: 'project05',
    index: '05',
    type: 'web',
    title: 'Project 05',
    date: 'Mar 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/05/thumbnail.webp',
    detailAnchor: '#project05'
  },
  {
    id: 'project06',
    index: '06',
    type: 'web',
    title: 'Project 06',
    date: 'Jan 2024',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/06/thumbnail.webp',
    detailAnchor: '#project06'
  },
  {
    id: 'project07',
    index: '07',
    type: 'web',
    title: 'Project 07',
    date: 'Nov 2023',
    category: 'UX·UI Web',
    thumbnail: '/images/projects/07/thumbnail.webp',
    detailAnchor: '#project07'
  }
]

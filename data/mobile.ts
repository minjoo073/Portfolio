import type { Project } from '@/lib/types/project'

/**
 * Mobile Projects — 2개
 *   M1: featured (배포·출시 완료 + 제작과정 HTML 있음, 케이스 → /work/<slug>)
 *   M2: archive  (배포 완료, 케이스 없음)
 *
 * 비주얼: portrait 19.5:9 영상 autoplay loop (5-10초, 무음)
 *   videoSrc / videoWebmSrc / videoPoster: 사용자 녹화 후 채움
 *
 * 이름 (title/slug)은 CEO 결정 대기 — 받으면 placeholder 교체.
 */
export const mobile: Project[] = [
  {
    id: 'mobile01',
    index: 'M1',
    type: 'mobile',
    title: 'App A', // CEO 입력 대기
    date: '2025',
    category: 'Mobile App',
    subline: '한 줄 설명 (CEO 입력 예정)',
    thumbnail: '/images/mobile/01/poster.webp',
    detailAnchor: '#mobile01',
    displayType: 'featured',
    workType: 'original',
    studyHref: '/work/app-a', // slug CEO 결정 후 교체
    // siteHref: 라이브 URL 추후
    videoSrc: '/videos/mobile/01.mp4',
    videoWebmSrc: '/videos/mobile/01.webm',
    videoPoster: '/images/mobile/01/poster.webp',
    aspectRatio: '390/844',
  },
  {
    id: 'mobile02',
    index: 'M2',
    type: 'mobile',
    title: 'App B', // CEO 입력 대기
    date: '2024',
    category: 'Mobile App',
    subline: '한 줄 설명 (CEO 입력 예정)',
    thumbnail: '/images/mobile/02/poster.webp',
    detailAnchor: '#mobile02',
    displayType: 'archive',
    workType: 'original',
    // studyHref 없음 (archive, 케이스 없음)
    // siteHref: 라이브 URL 추후
    videoSrc: '/videos/mobile/02.mp4',
    videoWebmSrc: '/videos/mobile/02.webm',
    videoPoster: '/images/mobile/02/poster.webp',
    aspectRatio: '390/844',
  },
]

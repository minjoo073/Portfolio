import type { MobileProject } from '@/lib/types/mobile-project'

/**
 * Mobile Projects — 2개
 *
 * 01: 자린고비 — featured (출시 완료 + 제작과정 HTML)
 * 02: TripMate — side (웹앱 출시, 앱 미출시)
 *
 * 비주얼: /images/m-projects/{01|02}/thumbnail.png
 *   — CEO 가 실제 파일을 올리기 전까지 404. 검은 박스로 표시됨.
 * previewVideo: CEO 가 파일 준비 시 경로만 추가하면 자동 video 태그 적용.
 */
export const mobileProjects: MobileProject[] = [
  {
    id: 'jaringobi',
    index: '01',
    title: '자린고비',
    category: '게임앱',
    releaseDate: 'May 2026',
    platforms: ['Android'],
    downloadLinks: {
      playStore:
        'https://play.google.com/store/apps/details?id=jaringobi.myapp&pli=1',
    },
    tagline: '아끼면 이긴다, 절약을 게임으로',
    thumbnail: '/images/mobile/01/thumbnail.png',
    // previewVideo: '/images/mobile/01/preview.mp4',  ← CEO 영상 준비 후 주석 해제
    studyHref: 'https://minjoo073.github.io/jaringobi_/',
    displayType: 'featured',
  },
  {
    id: 'tripmate',
    index: '02',
    title: 'TripMate',
    category: '여행동행 매칭',
    platforms: ['Web'],
    downloadLinks: {
      web: 'https://tripmate-mu-red.vercel.app',
    },
    stack: ['Expo', 'React Native', 'Expo Router'],
    tagline: '여행 동행, 더 쉽게',
    thumbnail: '/images/mobile/02/thumbnail.png',
    // studyHref: '',  // CEO 가 제작과정 URL 제공 시 교체
    displayType: 'side',
  },
]

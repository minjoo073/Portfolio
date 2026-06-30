import type { FreelanceItem } from '@/lib/types/freelance'

/**
 * 외주(CLIENT) 작업 4건 — CLIENT 네비 → 풀스크린 오버레이로만 노출 (메인 섹션 X).
 *
 * 구성: Cafe24 스킨 3 (LUNARE · AURÉ · fancive) + 웹 에이전시 구축 1 (웹네스트).
 *
 * ▷ 썸네일 넣는 법:
 *    1) 이미지를 public/images/freelance/ 에 저장 (예: lunare.webp, aure.webp, fancive.webp, webnest.webp)
 *    2) 각 항목의 thumbnail 주석을 해제
 *    thumbnail 미지정 시 모달이 회색 'IMAGE' placeholder 를 표시.
 */
export const freelanceItems: FreelanceItem[] = [
  {
    index: '01',
    title: 'LUNARE',
    category: 'Cafe24 스킨 · 코스메틱',
    description:
      '직접 브랜딩한 코스메틱 브랜드 LUNARE의 커머스 사이트를 카페24 스킨으로 구축한 외주 작업.',
    thumbnail: '/images/freelance/lunare.webp',
    thumbnailPosition: '5% 50%', // 좌측 텍스트(Light/softest) 안 잘리게 이미지를 우측으로
  },
  {
    index: '02',
    title: 'LORVÉ',
    category: 'Cafe24 스킨 · 패션',
    description:
      '룩북 형태의 브랜드 LORVÉ를 SS 시즌 겨냥 패션 쇼핑몰로 리뉴얼, 카페24 스킨으로 제작.',
    thumbnail: '/images/freelance/lorve.webp',
  },
  {
    index: '03',
    title: 'AURÉ',
    category: 'Cafe24 스킨 · 코스메틱',
    description:
      '코스메틱 브랜드 AURÉ의 커머스 사이트를 카페24 스킨으로 디자인·제작.',
    thumbnail: '/images/freelance/aure.webp',
  },
  {
    index: '04',
    title: 'WEBNEST',
    category: '웹 에이전시 · 웹사이트 구축',
    description:
      '웹·앱 에이전시 WEBNEST의 웹사이트 리뉴얼·구축 외주. 전반 디자인부터 관리자 페이지 포함 구축까지 완료.',
    thumbnail: '/images/freelance/webnest.webp',
  },
]

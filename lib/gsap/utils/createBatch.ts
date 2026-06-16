/**
 * ScrollTrigger.batch 래퍼 — N개 카드/아이템 일괄 reveal.
 * 4차 §4.5 webProjectsTimeline 패턴 추상화.
 * 개별 ScrollTrigger 대신 batch로 DOM 관찰 비용 절감.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type BatchOpts = {
  /** 뷰포트 진입 시 콜백 */
  onEnter?: ScrollTrigger.BatchCallback
  /** 뷰포트 이탈 시 콜백 */
  onLeave?: ScrollTrigger.BatchCallback
  /** 뷰포트 재진입(위에서) 콜백 */
  onEnterBack?: ScrollTrigger.BatchCallback
  /** 뷰포트 재이탈(위로) 콜백 */
  onLeaveBack?: ScrollTrigger.BatchCallback
  /** ScrollTrigger start — 기본값: 'top 85%' */
  start?: string
  /** ScrollTrigger end */
  end?: string
  /** 한 번만 실행 — 기본값: false */
  once?: boolean
  /** 한 batch에 포함될 최대 요소 수 */
  batchMax?: number
}

export function createBatch(
  targets: string | Element[],
  opts: BatchOpts = {}
): ScrollTrigger[] {
  const { start = 'top 85%', end, once = false, batchMax, ...callbacks } = opts

  return ScrollTrigger.batch(targets as string, {
    ...callbacks,
    start,
    ...(end !== undefined ? { end } : {}),
    once,
    ...(batchMax !== undefined ? { batchMax } : {})
  })
}

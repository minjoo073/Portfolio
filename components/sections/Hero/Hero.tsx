'use client'

/**
 * Hero — 패럴랙스 리빌 방식.
 *
 * 모션:
 *   ① 타이틀 WebGL 액체 렌즈  — TitleLiquid (Three.js, 데스크탑+!reduced 전용)
 *                               모바일/reduced: h1 정적 폴백.
 *   ② 마퀴 2줄 좌/우           — gsap marquee (row1: →, row2: ←, double-spread seamless).
 *   ③ 패럴랙스 리빌 (핀 제거):
 *       섹션 h-[240vh] 자연 스크롤 — sticky 없음. 페이지가 실제로 내려감.
 *       B. 타이틀 그룹 3단계 안무 (강디 설계 2026-06-17):
 *          Phase1 (0~20% scroll): y 0→80vh   상단→중앙 (power2.inOut)
 *          Phase2 (20~55% scroll): y 80→164vh 중앙 고정 (ease:none, 스크롤 1:1)
 *          Phase3 (55~80% scroll): y 164→284vh 중앙→하강 합쳐짐 (power2.in)
 *          80%+ scroll: y 284vh 유지. About(top 210vh)가 덮어 합쳐짐.
 *          검산: vp_pos = 18dvh - scroll_dvh + y → p0→18dvh, p0.2→50dvh, p0.55→50dvh(유지), p0.8→110dvh(이탈)
 *       C. 벨트  opacity fade   7%~18%
 *       D. 문단  y+opacity fade 7%~20%  (load onComplete 부착 패턴 유지)
 *       E. cue   opacity fade   top~5%
 *   ④ About 섹션(page.tsx) z-10 래퍼로 타이틀 위를 덮음.
 *      Hero section overflow-visible → 타이틀이 섹션 바깥에서도 렌더되어 About에 덮임.
 *
 * 헌법 준수:
 *   - 3조 예외: Hero 타이틀 한정 WebGL 허용 (CEO 승인 2026-06-17).
 *   - TitleLiquid 셰이더: ⛔ 수정 금지 (CEO 만족).
 *   - prefers-reduced-motion: 패럴랙스·페이드 skip, h-screen-dvh (빈 스크롤 방지).
 *   - 모바일: TitleLiquid 미마운트 (GPU 부담 회피).
 */

import { useEffect, useRef } from 'react'
import { heroMarqueeRow1, heroMarqueeRow2, heroBody } from '@/data/nav'
import { TitleLiquid } from './TitleLiquid'
import { registerGsap, gsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'

export function Hero() {
  const reduced  = useReducedMotionContext()
  const isMobile = useIsMobile()
  const sectionRef = useRef<HTMLElement>(null)

  /* WebGL 타이틀 굴절 활성: 데스크탑 && !reduced. */
  const useWebGL = !reduced && !isMobile

  useEffect(() => {
    registerGsap()
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const select = gsap.utils.selector(section)

      /* ── 마퀴 — double-spread seamless loop ─────────────────────── */
      const row1 = select('[data-marquee-row="1"]')[0] as HTMLElement | undefined
      const row2 = select('[data-marquee-row="2"]')[0] as HTMLElement | undefined

      if (row2) gsap.set(row2, { xPercent: -50 })

      if (!reduced) {
        if (row1) gsap.to(row1, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 })
        if (row2) gsap.to(row2, { xPercent: 0,   duration: 28, ease: 'none', repeat: -1 })
      }

      /* ── D prep: 문단 초기 상태 & load fade-in ──────────────────────
       *
       * 버그 원인 (기존):
       *   gsap.set(para, {opacity:0}) 직후 gsap.to 스크롤 트윈을 생성하면
       *   GSAP 이 그 시점의 opacity(=0) 를 from 값으로 캡처.
       *   스크롤 후 복귀 시 progress=0 → opacity=0 잔류.
       *
       * 해결:
       *   load 애니 fromTo 로 교체, onComplete 에서 ctx.add 로 scroll trigger 부착.
       *   → 두 트윈이 동시에 opacity 를 제어하지 않음.
       *   reduced: 즉시 opacity 1, scroll trigger 미부착.
       */
      const para = select('[data-hero-para]')[0] as HTMLElement | undefined

      if (reduced) {
        if (para) gsap.set(para, { opacity: 1, y: 0 })
      } else {
        if (para) {
          gsap.fromTo(
            para,
            { opacity: 0, y: 12 },
            {
              opacity:  1,
              y:        0,
              duration: 1.2,
              ease:     'power2.out',
              delay:    0.5,
              onComplete: () => {
                /* D. 문단 scroll fade — load 완료 후 부착 (ctx 에 포함) */
                ctx.add(() => {
                  gsap.fromTo(
                    para,
                    { opacity: 1, y: 0 },
                    {
                      opacity: 0,
                      y:       '-6vh',
                      ease:    'none',
                      scrollTrigger: {
                        trigger: section,
                        start:   '7% top',
                        end:     '20% top',
                        scrub:   1.5,
                      },
                    }
                  )
                })
              },
            }
          )
        }

        /* ── B. 타이틀 그룹 패럴랙스 3단계 안무 ────────────────────────
         * data-hero-title-group: TitleLiquid 래퍼 + h1 폴백을 묶은 그룹.
         *
         * 강디 수학 (totalDuration=1.0 으로 scroll% = timeline% 1:1 성립):
         *   Phase1 (0→0.20): y 0→80vh   상단→중앙 (power2.inOut)
         *   Phase2 (0.20→0.55): y 80→164vh 중앙 고정 (ease:none)
         *   Phase3 (0.55→0.80): y 164→284vh 중앙→하강 (power2.in)
         *   Placeholder (0.80→1.00): 아무 변화 없음 → y 284vh 유지
         *   → tl.to({},…,0.80) 으로 totalDuration=1.00 강제 (없으면 0.80 → 검산 불일치)
         *
         * CSS transform → 셰이더(canvas 내부 렌더) 영향 없음.
         * About(z-10 래퍼, page.tsx)가 불투명 다크로 덮어 합쳐짐 — opacity 트윈 불필요.
         */
        const titleGroupEl = select('[data-hero-title-group]')[0] as HTMLElement | undefined

        if (titleGroupEl) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start:   'top top',
              end:     'bottom top',
              scrub:   1.5,
            },
          })
          // Phase1 (0→20% scroll): 상단→중앙
          tl.fromTo(titleGroupEl, { y: 0 }, { y: '80vh', ease: 'power2.inOut', duration: 0.20 }, 0)
          // Phase2 (20→55% scroll): 중앙 고정 (스크롤 1:1)
          tl.to(titleGroupEl, { y: '164vh', ease: 'none', duration: 0.35 }, 0.20)
          // Phase3 (55→80% scroll): 중앙→하강 합쳐짐
          tl.to(titleGroupEl, { y: '284vh', ease: 'power2.in', duration: 0.25 }, 0.55)
          // 80%~100% scroll: y 284vh 유지 (placeholder — totalDuration=1.00 확보)
          tl.to({}, { duration: 0.20 }, 0.80)
        }

        /* ── C. 벨트 마퀴 fade-out ───────────────────────────────────
         * 7%~18% — 초반 스크롤에 빠르게 소멸. Phase1 초반 함께 사라짐.
         */
        const beltEl = select('[data-hero-belt]')[0] as HTMLElement | undefined

        if (beltEl) {
          gsap.fromTo(
            beltEl,
            { opacity: 1 },
            {
              opacity: 0,
              ease:    'none',
              scrollTrigger: {
                trigger: section,
                start:   '7% top',
                end:     '18% top',
                scrub:   1.5,
              },
            }
          )
        }

        /* ── E. Scroll cue fade-out ──────────────────────────────────
         * top~5% — 첫 스크롤에 즉시 소멸.
         */
        const cueEl = select('[data-hero-cue]')[0] as HTMLElement | undefined

        if (cueEl) {
          gsap.fromTo(
            cueEl,
            { opacity: 1 },
            {
              opacity: 0,
              ease:    'none',
              scrollTrigger: {
                trigger: section,
                start:   'top top',
                end:     '5% top',
                scrub:   1.5,
              },
            }
          )
        }
      }
    }, section)

    return () => { ctx.revert() }
  }, [reduced, isMobile, useWebGL])

  /*
   * reduced: h-screen-dvh 자연 스크롤 (빈 스크롤 없음).
   * !reduced: h-[240vh] 자연 스크롤 (240vh 스크롤 여유 거리 — Phase 합계 192vh + 여유).
   *
   * overflow-visible: 타이틀 그룹이 패럴랙스로 섹션 바깥으로 이동해도 렌더됨.
   *   → About(z-10)이 그 위를 덮어 "뒤로 들어가는" 효과 가능.
   * ⚠️ Hero section에 overflow-hidden 금지: 타이틀 패럴랙스 클리핑됨.
   *    마퀴 overflow 클립은 data-hero-belt 자체 컨테이너에서 처리.
   */
  return (
    <section
      ref={sectionRef}
      id="intro"
      className={
        reduced
          ? 'relative h-screen-dvh bg-hero-bg'
          : 'relative h-[240vh] bg-hero-bg overflow-visible'
      }
      data-section="intro"
    >
      {/*
        [타이틀 그룹] data-hero-title-group — B 패럴랙스 타임라인 대상.
        WebGL 래퍼(data-title-liquid) + h1 폴백을 묶어 같이 이동.
        h-screen-dvh: 첫 화면 높이 = 캔버스가 뷰포트를 꽉 채우는 영역.
        pointer-events-none: 스크롤·클릭 투과.
      */}
      <div
        data-hero-title-group
        className="absolute inset-x-0 top-0 h-screen-dvh z-[1] pointer-events-none"
      >
        {/*
          [WebGL 타이틀 래퍼] data-title-liquid — GSAP 스크롤 transform 대상.
          canvas 는 래퍼 안에서 w-full h-full 로 채움 → 해상도 유지, scale 픽셀레이션 없음.
          TitleLiquid 셰이더: ⛔ 수정 금지 (CEO 만족).
        */}
        {useWebGL && (
          <div
            data-title-liquid
            className="absolute inset-0 z-0"
          >
            <TitleLiquid className="w-full h-full block" />
          </div>
        )}

        {/*
          [h1 폴백 / SEO]
          WebGL 활성: sr-only (시각 숨김, 스크린리더·SEO 유지).
          WebGL 비활성: 정적으로 보임 (타이틀 그룹과 함께 패럴랙스).
        */}
        <h1
          data-hero-title
          className={[
            'pointer-events-none select-none absolute z-0',
            'top-[18%] px-side-m md:px-side-t xl:px-side-d',
            'font-sans font-black tracking-[-0.04em]',
            'text-ink-primary text-display-xl',
            useWebGL ? 'sr-only' : ''
          ].join(' ').trim()}
        >
          PORTFOLIO
        </h1>
      </div>{/* /타이틀 그룹 */}

      {/*
        [벨트 + 문단 스택] 흐름 배치 — absolute 제거.
        paddingTop: 18dvh(타이틀 top-[18%] of dvh) + clamp(72px,19vw,360px)(타이틀 높이).
        → 360px 캡 동일 적용 → 넓은 화면서도 타이틀 바닥에 정확히 붙음.
        → 기존 24vw 추정(캡 무시, 와이드서 띠지 이탈) 문제 해결.
        z-20: 타이틀(z-1) 위에. 패럴랙스 없이 자연 흐름 — 초반 스크롤에 빠르게 fade.
      */}
      <div
        className="relative w-full z-20 flex flex-col items-center"
        style={{ paddingTop: 'calc(18dvh + clamp(72px, 19vw, 360px) - 15px)' }}
      >
        {/* 흰 벨트 마퀴 — data-hero-belt(C 트윈). 풀폭 흰 띠. row1 좌행(22s), row2 우행(28s). */}
        <div
          data-hero-belt
          className="w-full overflow-hidden bg-white py-1 flex flex-col gap-0"
          aria-label="skill keywords"
        >
          <div
            data-marquee-row="1"
            className="flex gap-10 whitespace-nowrap will-change-transform"
          >
            {[...heroMarqueeRow1, ...heroMarqueeRow1].map((label, i) => (
              <span
                key={i}
                className="font-mono text-label font-light uppercase tracking-[0.1em] text-ink-primary"
              >
                {label}
              </span>
            ))}
          </div>

          <div
            data-marquee-row="2"
            className="flex gap-10 whitespace-nowrap will-change-transform"
          >
            {[...heroMarqueeRow2, ...heroMarqueeRow2].map((label, i) => (
              <span
                key={i}
                className="font-mono text-label font-light uppercase tracking-[0.1em] text-ink-muted"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* 문단 — 벨트 바로 아래(흐름, mt 간격). data-hero-para(D 트윈). */}
        <p
          data-hero-para
          className="mt-[8vh] w-[90%] max-w-[640px] text-center font-mono text-body uppercase leading-relaxed tracking-[0.08em] text-ink-primary"
        >
          {heroBody[0]}
          <br />
          {heroBody[1]}
        </p>
      </div>{/* /벨트+문단 스택 */}

      {/*
        [scroll cue] data-hero-cue — E 트윈 선택 대상.
        top-[calc(100dvh-5rem)]: 첫 화면(dvh) 하단 기준으로 고정.
        (기존 bottom-10은 stage 100dvh 기준이었음 — 이제 섹션이 240vh이므로 top 절대 위치로.)
      */}
      <div
        data-hero-cue
        className="absolute top-[calc(100dvh_-_5rem)] inset-x-0 z-20 flex justify-center"
      >
        {/* 중앙정렬은 flex(justify-center)로 — bounce transform 과 -translate-x 충돌 방지. opacity 낮춰 융화. */}
        <div className="flex flex-col items-center gap-2 animate-bounce-slow text-ink-muted opacity-50">
          <span className="font-mono text-label font-light uppercase tracking-[0.14em]">
            please scroll down
          </span>
          <svg className="block" width="9" height="12" viewBox="0 0 10 14" fill="none" aria-hidden="true">
            <path
              d="M5 0V13M5 13L1 9M5 13L9 9"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

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

import { useEffect, useRef, useState } from 'react'
import { registerGsap, gsap, ScrollTrigger } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { ParticlesBg } from '@/components/global/ParticlesBg'
import { useLenis } from '@/lib/hooks/useLenis'

const TITLE = 'PORTFOLIO'

export function Hero() {
  const reduced  = useReducedMotionContext()
  const isMobile = useIsMobile()
  const sectionRef = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  /* ── entrance ─────────────────────────────────────────────────────
   * 인트로(IntroOverlay) 가 떠있는 동안에는 Hero 가 가려져 있다가,
   * 인트로 exit 시작 시 'intro:exitStart' 이벤트로 동시에 떠오름.
   * 인트로 없이 직접 진입(새로고침·해시 진입)이면 즉시 entered=true.
   */
  const [entered, setEntered] = useState(false)
  const darkOverlayRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (reduced) {
      setEntered(true)
      return
    }
    // 새 영상 인트로: z-[9999] fixed div (aria-hidden). 인트로 div 존재 여부로 감지.
    const introExists = typeof document !== 'undefined' && !!document.querySelector('[data-intro-overlay]')
    if (!introExists) {
      setEntered(true)
      return
    }
    // 인트로 가 완전히 사라진 뒤 (intro:exitEnd) Hero entrance — 글자 떨어짐을 처음부터 보여줌
    const onEnd = () => setEntered(true)
    window.addEventListener('intro:exitEnd', onEnd)
    return () => window.removeEventListener('intro:exitEnd', onEnd)
  }, [reduced])

  useEffect(() => {
    registerGsap()
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const select = gsap.utils.selector(section)

      /* ── 초기 상태: 글자/캡션 invisible — 별도 useEffect[entered] 에서 등장 트윈
       * reduced/모바일: 즉시 visible (entrance 트윈 없음)
       */
      const para = select('[data-hero-para]')[0] as HTMLElement | undefined
      const letters = select('[data-hero-letter]') as HTMLElement[]

      if (reduced || isMobile) {
        if (para) gsap.set(para, { opacity: 1, y: 0 })
        if (letters.length) gsap.set(letters, { y: 0, opacity: 1 })
      } else {
        // entrance 전 invisible — wrapper opacity 와 별개로 letters/para 가 깜빡이지 않도록
        if (letters.length) gsap.set(letters, { y: '-110vh', opacity: 0 })
        if (para) gsap.set(para, { opacity: 0, y: 14 })

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

        /* PORTFOLIO fade out 폐기 — Letter Explosion transition 이 letters 흩어짐으로 대체.
         * title-group opacity 0 되면 letters 도 안 보여서 explosion 효과 X.
         */

        /* Letter Explosion 일시 제거 — PORTFOLIO entrance 검증용 */

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
  }, [reduced, isMobile])

  /* ── entrance 트윈 — entered=true 시 PORTFOLIO 글자 stagger 떨어짐 + 캡션 fade in
   * onComplete: 캡션 scroll-fade trigger 부착 (entrance 와 scroll trigger 가 opacity 충돌 안 하도록 순차)
   */
  useEffect(() => {
    if (!entered) return
    if (reduced || isMobile) return
    const section = sectionRef.current
    if (!section) return

    /* ── 드롭 중 스크롤 잠금 ─────────────────────────────────────────
     * PORTFOLIO 글자가 다 떨어지기 전에 스크롤하면 Hero→About zoom transition 이
     * 동시 발동해 "중간까지 떨어졌다 다시 하단으로" 더블드롭/버퍼링처럼 보임.
     * → 글자 다 떨어진 뒤(timeline onComplete)에만 스크롤 허용.
     */
    const l = lenisRef.current
    l?.stop()
    document.body.style.overflow = 'hidden'
    if (!window.location.hash) window.scrollTo(0, 0) // 해시 진입(딥링크)은 위치 보존
    const blockScroll = (e: Event) => e.preventDefault()
    window.addEventListener('wheel', blockScroll, { passive: false })
    window.addEventListener('touchmove', blockScroll, { passive: false })
    let unlocked = false
    const unlockScroll = () => {
      if (unlocked) return
      unlocked = true
      window.removeEventListener('wheel', blockScroll)
      window.removeEventListener('touchmove', blockScroll)
      document.body.style.overflow = ''
      lenisRef.current?.start()
    }
    // 안전 폴백 — 어떤 이유로 onComplete 누락 시에도 4s 후 잠금 해제
    const failSafe = window.setTimeout(unlockScroll, 4000)

    registerGsap()
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>('[data-hero-letter]', section)
      const para = section.querySelector<HTMLElement>('[data-hero-para]')

      const tl = gsap.timeline({
        onComplete: () => {
          unlockScroll() // 글자 다 떨어진 후 스크롤 허용
          if (para) {
            gsap.fromTo(
              para,
              { opacity: 1, y: 0 },
              {
                opacity: 0,
                y: '-6vh',
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: '7% top',
                  end: '20% top',
                  scrub: 1.5,
                },
              }
            )
          }
          // entrance 완료 이벤트 — IntroOverlay 의 unlock listener 가 정확한 시점에 lock 해제
          window.dispatchEvent(new CustomEvent('hero:entranceEnd'))
        },
      })

      // 글자 한 글자씩 뚝뚝 — stagger 0.22 (한 글자씩 또렷이 분리), duration 0.55 (떨어짐 빠르게)
      // ease power4.out: 무게감 있게 떨어져 stop (bounce 금지)
      if (letters.length) {
        tl.to(
          letters,
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power4.out',
            stagger: 0.22,
          },
          0
        )
      }

      // 캡션 — 글자 거의 다 떨어진 뒤 fade in (delay 강조)
      if (para) {
        tl.to(
          para,
          { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
          1.8
        )
      }
    }, section)

    return () => {
      window.clearTimeout(failSafe)
      unlockScroll()
      ctx.revert()
    }
  }, [entered, reduced, isMobile])

  /* ── Hero → About zoom transition (scrub 패턴) ──────────────────
   * 사용자 스크롤 = zoom 진행도 1:1 동기화. Hero h-[200vh] 안에서 진행 → viewport 항상 Hero 안 → 다크 미리 노출 X.
   * start: 사용자 살짝 스크롤 시작. end: Hero 끝 도달 = 검정 가득 + About 진입.
   * Phase 1: title-group 중앙으로 이동. Phase 2: 확대. Phase 3: 검정 overlay fade in.
   */
  useEffect(() => {
    if (reduced || isMobile) return
    if (!entered) return
    const section = sectionRef.current
    if (!section) return

    registerGsap()
    const titleGroup = section.querySelector<HTMLElement>('[data-hero-title-group]')
    const titleH1 = section.querySelector<HTMLElement>('[data-hero-title]')
    if (!titleGroup || !titleH1) return

    /* ── h1 직접 transform 시뮬 (WebGL canvas 폐기) ────────────────
     * Phase A (0~0.3): translateY -15vh — 텍스트 위로 자연 이동 (스크롤 인지)
     * Phase B (0.3~0.85): scaleY 1→3 + translateY 아래로 + blur — 아이스크림 녹음
     * Phase C (0.55~1.0): darkOverlay opacity 1 — about bg-dark 합체
     */
    const tl = gsap.timeline()
    const darkOverlay = darkOverlayRef.current
    if (darkOverlay) gsap.set(darkOverlay, { autoAlpha: 0 })
    gsap.set(titleH1, { clearProps: 'transform,filter', transformOrigin: 'top center' })

    // letters 각각 transform 위해 selector
    const letters = gsap.utils.toArray<HTMLElement>('[data-hero-letter]', section)
    gsap.set(letters, { transformOrigin: 'top center', clearProps: 'filter' })

    // Phase A — h1 위로 자연 이동
    tl.to(titleH1, { y: '-15vh', ease: 'power2.inOut', duration: 0.3 }, 0)
    // Phase B — 글자별 stagger drip (선명, blur X — scaleY stretch + 아래로 흘러내림)
    tl.to(letters, {
      scaleY: 3.5,
      y: '+=28vh',
      ease: 'power2.in',
      duration: 0.5,
      stagger: { each: 0.025, from: 'random' },
    }, 0.3)
    // 글자 자체 fade out (drip 끝)
    tl.to(letters, { autoAlpha: 0, ease: 'power2.in', duration: 0.2, stagger: 0.02 }, 0.7)
    // Phase C — darkOverlay
    if (darkOverlay) tl.to(darkOverlay, { autoAlpha: 1, ease: 'power1.in', duration: 0.4 }, 0.5)

    tl.to({}, {}, 1.0)

    // pin 폐기 — pin 이 page height 변화 → AboutIndex 등 다른 ScrollTrigger position 캐시 깨뜨림.
    // 대신 Hero h-[200vh] + about wrapper z-[1] -mt-[100vh] (Hero z-2 가 위 = about 가려짐) 으로
    // viewport 안 다크 미리 노출 차단. AboutIndex 자체 효과 그대로 보존.
    // scrub 0.3 (자체 smoothing) — monotonic guard 폐기, 역스크롤 시 자연 reverse 복원
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.3,
      animation: tl,
      onLeave: () => {
        // forward 통과 시 — 다음 섹션 잔상 차단 (display none) + darkOverlay fade out (about 노출)
        titleGroup.style.display = 'none'
        if (darkOverlay) {
          gsap.to(darkOverlay, {
            autoAlpha: 0, duration: 0.2, ease: 'power2.out',
            onComplete: () => { darkOverlay.style.display = 'none' },
          })
        }
        // st.kill() / tl.progress(1).pause() 폐기 — 역스크롤 시 자연 reverse 위해 scrub 유지
      },
      onEnterBack: () => {
        // 역스크롤 진입 시 display 만 복원. scrub timeline 이 사용자 scroll 따라 자동 갱신.
        titleGroup.style.display = ''
        if (darkOverlay) darkOverlay.style.display = ''
      },
    })
    // ScrollTrigger.refresh() 폐기 — 사용자 scroll 도중 호출 시 CPU 스파이크

    return () => { st.kill(); tl.kill() }
  }, [entered, reduced, isMobile])

  /* ── entrance wrapper style ─────────────────────────────────────
   * 인트로 exit 와 동시에 Hero 가 살짝 위로 떠오르며 fade in.
   * 인트로 카드들이 위로 흘러 사라지는 흐름의 연속 → 두 섹션 유기적 연결.
   */
  const entranceStyle: React.CSSProperties = {
    opacity: entered ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 250ms ease-out',
    // willChange 제거 — layer promotion 의 활성/해제 변화 시점에 fixed child(title-group) 의
    // containing block 이 wrapper layer ↔ viewport 변경되어 letter 위치 jump 발생.
  }

  /*
   * reduced: h-screen-dvh 자연 스크롤 (빈 스크롤 없음).
   * !reduced: h-[240vh] 자연 스크롤 (240vh 스크롤 여유 거리 — Phase 합계 192vh + 여유).
   *
   * overflow-visible: 타이틀 그룹이 패럴랙스로 섹션 바깥으로 이동해도 렌더됨.
   *   → About(z-10)이 그 위를 덮어 "뒤로 들어가는" 효과 가능.
   * ⚠️ Hero section에 overflow-hidden 금지: 타이틀 패럴랙스 클리핑됨.
   *    마퀴 overflow 클립은 data-hero-belt 자체 컨테이너에서 처리.
   */
  /* ── 모바일: 패럴랙스 없이 한 화면 세로 중앙 정렬 (PORTFOLIO·벨트·문단) ──── */
  if (isMobile) {
    return (
      <div style={entranceStyle}>
      <section
        ref={sectionRef}
        id="intro"
        data-section="intro"
        className="relative z-[2] h-screen-dvh bg-hero-bg flex flex-col overflow-hidden"
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-[6vh] w-full">
          {/* 워드마크 — 폭맞춤. 글자별 span split → entrance stagger */}
          <h1
            data-hero-title
            aria-label="PORTFOLIO"
            className="select-none font-sans font-black tracking-[-0.04em] text-ink-primary text-[15vw] leading-[0.92] text-center w-full px-side-m"
          >
            {TITLE.split('').map((c, i) => (
              <span
                key={i}
                data-hero-letter
                aria-hidden="true"
                style={{ display: 'inline-block', willChange: 'transform' }}
              >
                {c}
              </span>
            ))}
          </h1>

          {/* 캡션 박스 — 인트로 카드와 동일 톤 (mono 3줄) */}
          <div
            data-hero-para
            className="text-center uppercase text-ink-primary"
            style={{ fontSize: 11, lineHeight: 1.75, letterSpacing: '0.14em', fontFamily: "'IBM Plex Mono', 'Pretendard Variable', sans-serif" }}
          >
            <div style={{ fontWeight: 600 }}>박민주 / PARK MINJOO</div>
            <div style={{ opacity: 0.7 }}>UX/UI 디자이너 &amp; 웹 퍼블리셔</div>
            <div style={{ opacity: 0.4 }}>2026</div>
          </div>
        </div>

        {/* scroll cue — 우하단 미니멀 */}
        <div className="shrink-0 pb-6 pr-side-m flex justify-end">
          <span className="font-mono uppercase text-ink-muted" style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.55 }}>
            ↓ Scroll
          </span>
        </div>
      </section>
      </div>
    )
  }

  return (
    <>
    {/* dark overlay — about 진입 직전 검정 fade in */}
    <div
      ref={darkOverlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0A0A0A',
        opacity: 0,
        visibility: 'hidden',
        zIndex: 20,
        pointerEvents: 'none',
        willChange: 'opacity',
      }}
    />
    <div style={entranceStyle}>
    {/* 별가루 — Hero 진입 후 PORTFOLIO 글자 뒤로 떠다님 (cubiflow 톤) */}
    <ParticlesBg />
    <section
      ref={sectionRef}
      id="intro"
      className={
        reduced
          ? 'relative z-[2] h-screen-dvh bg-hero-bg'
          : 'relative z-[2] h-[200vh] bg-hero-bg overflow-visible'
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
        className="fixed inset-x-0 bottom-[4vh] z-[30] pointer-events-none"
      >
        {/* filter 는 h1 (글자 element) 에만 적용 — 페이지 전체 흔들림 차단, 글자만 액체 morph */}
        <h1
          data-hero-title
          aria-label="PORTFOLIO"
          className="pointer-events-none select-none block z-0 px-0 font-sans font-black tracking-[-0.05em] text-ink-primary leading-[0.92] whitespace-nowrap text-center"
          style={{ fontSize: 'min(17.5vw, 360px)' }}
        >
          {TITLE.split('').map((c, i) => (
            <span
              key={i}
              data-hero-letter
              aria-hidden="true"
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              {c}
            </span>
          ))}
        </h1>
      </div>{/* /타이틀 그룹 */}

      {/*
        [캡션 박스] absolute 상단 영역.
        글자가 하단으로 떨어지므로 캡션은 상단(약 30%)에 위치 — 두 요소가 시선 위→아래로 흐름.
      */}
      <div
        data-hero-para
        className="absolute z-[31] inset-x-0 top-[28%] text-center uppercase text-ink-primary"
        style={{ fontSize: 12, lineHeight: 1.75, letterSpacing: '0.14em', fontFamily: "'IBM Plex Mono', 'Pretendard Variable', sans-serif" }}
      >
        <div style={{ fontWeight: 600 }}>박민주 / PARK MINJOO</div>
        <div style={{ opacity: 0.7 }}>UX/UI 디자이너 &amp; 웹 퍼블리셔</div>
        <div style={{ opacity: 0.4 }}>2026</div>
      </div>

      {/*
        [scroll cue] data-hero-cue — E 트윈 선택 대상.
        우하단 미니멀 mono — 인트로 캡션 톤. bouncing 제거 (quiet luxury).
      */}
      <div
        data-hero-cue
        className="absolute top-[calc(100dvh_-_3rem)] right-side-m md:right-side-t xl:right-side-d z-20"
      >
        <span className="font-mono uppercase text-ink-muted" style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.55 }}>
          ↓ Scroll
        </span>
      </div>

      {/*
        [Hero → About chapter marker] — A(hairline) + D(mono index) 결합.
        Hero bottom 도달 시 hairline 좌→우 draw + mono "01 / 06 ABOUT MINJOO" fade-in.
        About 진입 후 자동 fade out (z-[28] PORTFOLIO z-30 아래, 캡션 z-31 아래).
        position fixed — viewport bottom 14vh 에 sticky, 잡지 챕터 표지 어휘.
      */}
    </section>
    </div>
    </>
  )
}

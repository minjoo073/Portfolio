'use client'

/**
 * MobileProjects — 섹션 루트 (옵션 C · Horizontal Spread)
 *
 * 구조:
 *   tall 컨테이너 height: 200vh (2페이지 × 100vh)
 *   ├── sticky wrapper (CSS sticky, GSAP pin 아님)
 *   │   ├── pages-track (flex row, width: 200%, translateX 이동)
 *   │   │   ├── AppPage  (page 0 — 자린고비)
 *   │   │   └── AppPage  (page 1 — TripMate)
 *   │   └── PageIndicator (absolute 우하단)
 *   └── step markers (normal flow, pointer-events:none)
 *
 * 모션:
 *   - wheel cooldown 900ms / MIN_DELTA 5
 *   - boundary: page 0 + up → 위 섹션, page 1 + down → 아래 섹션
 *   - Lenis 차단: ScrollTrigger onEnter/onLeave data-lenis-prevent 토글
 *   - 페이지 전환: gsap.to track, x: N×-50%, 0.85s, power3.inOut
 *   - 페이지 reveal: data-reveal targets, y:20→0, opacity:0→1, stagger 0.08
 *   - 키보드 ← → 화살표 지원
 *
 * 번쩍 fix:
 *   - 초기 page 0 은 자연 visible 로 시작 (revealPage 발화 안 함)
 *   - onEnterBack 에서만 revealPage(page0) 발화 (위에서 재진입 시 reveal)
 *   - ScrollTrigger.refresh 는 sectionTop 재계산 목적으로만 유지
 */

import { useRef, useState } from 'react'
import { useGsapContext } from '@/lib/hooks/useGsapContext'
import { registerGsap } from '@/lib/gsap/config'
import { useReducedMotionContext } from '@/components/global/ReducedMotionProvider'
import { useLenis } from '@/lib/hooks/useLenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { mobileProjects } from '@/data/mobile-projects'
import { AppPage } from './AppPage'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'

const TOTAL_PAGES = 2
const COOLDOWN_MS = 1050
const MIN_DELTA   = 5
const TOUCH_THRESHOLD = 50

export function MobileProjects() {
  const reduced     = useReducedMotionContext()
  const isMobile    = useIsMobile()
  const sectionRef  = useRef<HTMLDivElement>(null)
  const trackRef    = useRef<HTMLDivElement>(null)
  const lenis       = useLenis()
  const lenisRef    = useRef(lenis)
  lenisRef.current  = lenis

  const [currentPage, setCurrentPage] = useState(0)
  // ref 로도 유지 — wheel 핸들러 클로저에서 최신값 접근
  const currentPageRef = useRef(0)

  const projectA = mobileProjects.find((p) => p.id === 'jaringobi')!
  const projectB = mobileProjects.find((p) => p.id === 'tripmate')!

  useGsapContext(
    () => {
      registerGsap()

      const section = sectionRef.current
      const track   = trackRef.current
      if (!section || !track) return

      if (reduced) return
      if (isMobile) return // 모바일: 세로 스택 렌더 → 가로 페이징/sticky/wheel 미사용

      // ── sectionTop 추적 ──────────────────────────────────────────
      let sectionTop = section.getBoundingClientRect().top + window.scrollY

      // ── 헬퍼: page el 수집 ──────────────────────────────────────
      const getPageEl = (index: number): HTMLElement | null =>
        section.querySelector<HTMLElement>(`[data-page="${index}"]`)

      // ── reveal / reset ───────────────────────────────────────────
      const revealPage = (pageEl: HTMLElement) => {
        const targets = Array.from(
          pageEl.querySelectorAll<HTMLElement>('[data-reveal]')
        )
        if (targets.length === 0) return
        gsap.fromTo(
          targets,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
            overwrite: 'auto',
          }
        )
      }

      const resetPage = (pageEl: HTMLElement) => {
        const targets = Array.from(
          pageEl.querySelectorAll<HTMLElement>('[data-reveal]')
        )
        if (targets.length === 0) return
        gsap.set(targets, { y: 20, opacity: 0 })
      }

      // ── goTo ─────────────────────────────────────────────────────
      const goTo = (nextIndex: number) => {
        const prevIndex = currentPageRef.current

        const prevEl = getPageEl(prevIndex)

        // track 이동 (50% 단위) — 이전 페이지는 *보인 채* 슬라이드되고,
        // 화면 밖으로 빠진 뒤에 reset (깜빡임 방지 + 재방문 시 재등장용)
        gsap.to(track, {
          x: `${nextIndex * -50}%`,
          duration: 1.0,
          ease: 'power2.inOut',
          overwrite: 'auto',
          onComplete: () => {
            if (prevEl) resetPage(prevEl)
          },
        })

        // 실제 scrollY 도 동기 — sticky 가 page N 위치에 머물게 (역스크롤 시 page 0 로 자연 복귀)
        const targetY = sectionTop + nextIndex * window.innerHeight
        lenisRef.current?.scrollTo(targetY, {
          duration: 1.0,
          easing: (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
          lock: false,
          force: true,
        })

        // reveal 새 페이지 (약간 지연 — track 이동 시작 직후)
        const nextEl = getPageEl(nextIndex)
        if (nextEl) {
          gsap.delayedCall(0.15, () => revealPage(nextEl))
        }

        currentPageRef.current = nextIndex
        setCurrentPage(nextIndex)
      }

      // ── sticky 체크 ──────────────────────────────────────────────
      const isPinActive = () => {
        const rect = section.getBoundingClientRect()
        return rect.top <= 1 && rect.bottom >= window.innerHeight - 1
      }

      // ── ScrollTrigger: sectionTop 추적 + Lenis 차단 토글 ─────────
      let cooldown = false

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          sectionTop = self.start
        },
        onEnter: () => section.setAttribute('data-lenis-prevent', ''),
        onLeave: () => section.removeAttribute('data-lenis-prevent'),
        onEnterBack: () => {
          section.setAttribute('data-lenis-prevent', '')
          // 위에서 재진입 시 page 0 reveal (이미 page 0 에 있을 때만)
          if (currentPageRef.current === 0) {
            const page0 = getPageEl(0)
            if (page0) revealPage(page0)
          }
        },
        onLeaveBack: () => section.removeAttribute('data-lenis-prevent'),
      })

      // ── wheel 핸들러 ─────────────────────────────────────────────
      const handleWheel = (e: WheelEvent) => {
        const delta = e.deltaY

        if (delta > MIN_DELTA) {
          if (!isPinActive()) return

          // 마지막 페이지 → 아래 섹션 진입
          if (currentPageRef.current >= TOTAL_PAGES - 1) {
            e.preventDefault()
            if (cooldown) return
            cooldown = true
            const sectionBottom = sectionTop + section.offsetHeight
            lenisRef.current?.scrollTo(sectionBottom + 1, {
              duration: 0.6,
              lock: false,
              force: true,
            })
            setTimeout(() => { cooldown = false }, COOLDOWN_MS)
            return
          }

          e.preventDefault()
          if (cooldown) return
          cooldown = true
          // Lenis momentum 차단 — 세게 wheel 시 sticky 풀려서 트립메이트 건너뛰는 문제 방지
          lenisRef.current?.stop()
          goTo(currentPageRef.current + 1)
          setTimeout(() => {
            cooldown = false
            lenisRef.current?.start()
          }, COOLDOWN_MS)
          return
        }

        if (delta < -MIN_DELTA) {
          if (!isPinActive()) return

          // 첫 페이지 → 위 섹션 진입
          if (currentPageRef.current <= 0) {
            e.preventDefault()
            if (cooldown) return
            cooldown = true
            lenisRef.current?.scrollTo(sectionTop - window.innerHeight, {
              duration: 0.6,
              lock: false,
              force: true,
            })
            setTimeout(() => { cooldown = false }, COOLDOWN_MS)
            return
          }

          e.preventDefault()
          if (cooldown) return
          cooldown = true
          // Lenis momentum 차단 — 반대 방향도 동일 보호
          lenisRef.current?.stop()
          goTo(currentPageRef.current - 1)
          setTimeout(() => {
            cooldown = false
            lenisRef.current?.start()
          }, COOLDOWN_MS)
        }
      }

      // ── 터치 핸들러 ──────────────────────────────────────────────
      let touchStartX = 0

      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0]?.clientX ?? 0
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!isPinActive()) return
        const deltaX = touchStartX - (e.touches[0]?.clientX ?? 0)
        if (Math.abs(deltaX) < TOUCH_THRESHOLD) return

        if (deltaX > 0 && currentPageRef.current < TOTAL_PAGES - 1) {
          e.preventDefault()
          if (cooldown) return
          cooldown = true
          goTo(currentPageRef.current + 1)
          touchStartX = e.touches[0]?.clientX ?? 0
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        } else if (deltaX < 0 && currentPageRef.current > 0) {
          e.preventDefault()
          if (cooldown) return
          cooldown = true
          goTo(currentPageRef.current - 1)
          touchStartX = e.touches[0]?.clientX ?? 0
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        }
      }

      // ── 키보드 핸들러 (a11y) ─────────────────────────────────────
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isPinActive()) return
        if (e.key === 'ArrowRight' && currentPageRef.current < TOTAL_PAGES - 1) {
          if (cooldown) return
          cooldown = true
          goTo(currentPageRef.current + 1)
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        } else if (e.key === 'ArrowLeft' && currentPageRef.current > 0) {
          if (cooldown) return
          cooldown = true
          goTo(currentPageRef.current - 1)
          setTimeout(() => { cooldown = false }, COOLDOWN_MS)
        }
      }

      // ── 이벤트 등록 ──────────────────────────────────────────────
      section.addEventListener('wheel',      handleWheel,      { passive: false })
      section.addEventListener('touchstart', handleTouchStart, { passive: true })
      section.addEventListener('touchmove',  handleTouchMove,  { passive: false })
      window.addEventListener('keydown',     handleKeyDown)

      // ── sectionTop 재계산 (ScrollTrigger.refresh) ───────────────
      // 번쩍 방지: page 0 revealPage 는 발화하지 않음 — MobileWorkIntro 의
      // EXIT 커튼이 자린고비 visible 진입을 가려줌 → 자연 전환 보장
      gsap.delayedCall(0.15, () => {
        ScrollTrigger.refresh?.()
        sectionTop = section.getBoundingClientRect().top + window.scrollY
      })

      // ── cleanup ──────────────────────────────────────────────────
      return () => {
        section.removeEventListener('wheel',      handleWheel)
        section.removeEventListener('touchstart', handleTouchStart)
        section.removeEventListener('touchmove',  handleTouchMove)
        window.removeEventListener('keydown',     handleKeyDown)
        st.kill()
      }
    },
    sectionRef,
    [isMobile] // isMobile 확정 시 재실행(모바일 가드)
  )

  /* ── 모바일: 세로 스택 (가로 페이징/sticky 없이 자연 스크롤) ───────────── */
  if (isMobile) {
    return (
      <section
        id="mobile"
        data-section="mobile-projects"
        aria-label="Mobile Projects"
        style={{ position: 'relative', background: '#0A0A0A' }}
      >
        <AppPage project={projectA} pageIndex={0} total={TOTAL_PAGES} mobile />
        {/* 두 프로젝트 사이 hairline 구분 */}
        <div
          aria-hidden
          style={{
            height: '1px',
            margin: '0 clamp(20px, 5vw, 32px)',
            background: 'rgba(248,247,244,0.10)',
          }}
        />
        <AppPage project={projectB} pageIndex={1} total={TOTAL_PAGES} mobile />
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="mobile"
      data-section="mobile-projects"
      aria-label="Mobile Projects"
      style={{
        height: `${TOTAL_PAGES * 100}vh`,
        position: 'relative',
        background: '#0A0A0A',
      }}
    >
      {/* ── sticky wrapper ───────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#0A0A0A',
        }}
        data-mobile-sticky-wrapper
      >
        {/* ── pages track ─────────────────────────────────────────── */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            width: '200%',
            height: '100%',
            willChange: 'transform',
          }}
          data-pages-track
        >
          {/* Page 0 — 자린고비 */}
          <AppPage
            project={projectA}
            pageIndex={0}
            total={TOTAL_PAGES}
            hasNext
            onNext={() => {
              if (currentPageRef.current === 0) {
                const track = trackRef.current
                if (!track) return
                const nextIndex = 1
                const prevEl = sectionRef.current?.querySelector<HTMLElement>('[data-page="0"]')
                gsap.to(track, {
                  x: '-50%', duration: 1.0, ease: 'power2.inOut', overwrite: 'auto',
                  onComplete: () => {
                    if (prevEl) gsap.set(prevEl.querySelectorAll('[data-reveal]'), { y: 20, opacity: 0 })
                  },
                })
                const nextEl = sectionRef.current?.querySelector<HTMLElement>('[data-page="1"]')
                if (nextEl) gsap.delayedCall(0.15, () => {
                  const targets = nextEl.querySelectorAll('[data-reveal]')
                  gsap.fromTo(targets, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, overwrite: 'auto' })
                })
                currentPageRef.current = nextIndex
                setCurrentPage(nextIndex)
              }
            }}
          />

          {/* Page 1 — TripMate (마지막 페이지, hasNext=false) */}
          <AppPage
            project={projectB}
            pageIndex={1}
            total={TOTAL_PAGES}
            hasNext={false}
          />
        </div>
      </div>

      {/* ── step markers (normal flow) ───────────────────────────── */}
      {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
        <div
          key={i}
          data-step-marker={i}
          style={{
            position: 'absolute',
            top: `${i * 100}vh`,
            height: '100vh',
            width: '1px',
            left: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden
        />
      ))}
    </section>
  )
}

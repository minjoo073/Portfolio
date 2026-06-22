'use client'

/**
 * IntroPage — 매거진 표지 (page 0)
 *
 * 레이아웃:
 *   top row:    MOBILE PROJECTS (좌)          IV / VII (우)
 *   hair-strong 1px full-width
 *   center:     manifesto editorial (PP Editorial, large)
 *   hair-strong 1px full-width
 *   bottom row: COVER (좌)                    01 / 03 → (우)
 *
 * data-reveal 어트리뷰트: MobileProjects 에서 revealPage() 대상으로 수집
 */

/* ── vw 스케일 헬퍼 (base 1920) ──────────────────────────────────── */
const vw = (basePx: number, minPx: number) =>
  `clamp(${minPx}px, ${((basePx / 1920) * 100).toFixed(4)}vw, ${basePx}px)`

/* ── 토큰 ──────────────────────────────────────────────────────────── */
const INK_30   = 'rgba(248,247,244,0.30)'
const INK_25   = 'rgba(248,247,244,0.25)'
const INK_55   = 'rgba(248,247,244,0.55)'
const INK_100  = 'rgba(248,247,244,1.00)'
const HAIR_STR = 'rgba(248,247,244,0.14)'
const PAD      = 'clamp(56px, 6vw, 112px)'

interface IntroPageProps {
  /** 우측 하단 → 클릭 시 page 1 로 이동 */
  onNext: () => void
  /** 다음 페이지 있음 여부 — 마지막 페이지 시 화살표 숨김 */
  hasNext?: boolean
}

export function IntroPage({ onNext, hasNext = true }: IntroPageProps) {
  return (
    <div
      data-page="0"
      style={{
        width: '33.333%',
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: PAD,
        boxSizing: 'border-box',
        position: 'relative',
      }}
      aria-label="Mobile Projects 소개 표지"
    >
      {/* ── top row ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '20px',
        }}
        data-reveal
      >
        <span
          style={{
            fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
            fontSize: '12px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK_30,
          }}
        >
          Mobile Projects
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK_30,
          }}
        >
          {/* IV / VII — Mobile Projects는 7섹션 중 4번째. 강팀장 확인 필요 */}
          IV / VII
        </span>
      </div>

      {/* ── top hairline ────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: HAIR_STR,
          flexShrink: 0,
        }}
        aria-hidden
        data-reveal
      />

      {/* ── center manifesto ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display), var(--font-pretendard), sans-serif',
            fontSize: vw(120, 64),
            fontWeight: 400,
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
            color: INK_100,
            margin: 0,
            wordBreak: 'keep-all',
          }}
          data-reveal
        >
          {/* TODO: CEO 확인 — 최종 카피 교체 */}
          Two apps,
          <br />
          one designer,
          <br />
          one keyboard.
        </h2>
      </div>

      {/* ── bottom hairline ─────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: HAIR_STR,
          flexShrink: 0,
          marginBottom: '20px',
        }}
        aria-hidden
        data-reveal
      />

      {/* ── bottom row ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
        data-reveal
      >
        <span
          style={{
            fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK_25,
          }}
        >
          Cover
        </span>

        {hasNext && (
          <button
            onClick={onNext}
            aria-label="다음 페이지 (자린고비)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-mono), var(--font-pretendard), monospace',
              fontSize: '13px',
              letterSpacing: '0.14em',
              color: INK_55,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.color = INK_100
              const arrow = el.querySelector<HTMLSpanElement>('[data-arrow]')
              if (arrow) arrow.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.color = INK_55
              const arrow = el.querySelector<HTMLSpanElement>('[data-arrow]')
              if (arrow) arrow.style.transform = 'translateX(0)'
            }}
          >
            <span>01 / 03</span>
            <span
              data-arrow
              style={{
                display: 'inline-block',
                transition: 'transform 200ms ease',
              }}
            >
              →
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

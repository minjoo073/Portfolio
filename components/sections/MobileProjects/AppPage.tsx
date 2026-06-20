'use client'

/**
 * AppPage — 매거진 펼친 면 (page 1 · 2 공유)
 *
 * 구조:
 *   좌 50vw: 폰 mock (중앙 정렬, maxHeight 78vh, 9:19.5)
 *   책등 hairline 60vh (수직 중앙)
 *   우 50vw: meta rail + body(워드마크 + tagline + uxIntent + CTA)
 *
 * data-reveal: MobileProjects 에서 revealPage()/resetPage() 대상 수집
 */

import { useState } from 'react'
import { PhoneMockup } from './PhoneMockup'
import { StudyDrawer } from './StudyDrawer'
import type { MobileProject } from '@/lib/types/mobile-project'

/* ── vw 스케일 헬퍼 (base 1920) ──────────────────────────────────── */
const vw = (basePx: number, minPx: number) =>
  `clamp(${minPx}px, ${((basePx / 1920) * 100).toFixed(4)}vw, ${basePx}px)`

/* ── 토큰 ──────────────────────────────────────────────────────────── */
const INK_100  = 'rgba(248,247,244,1.00)'
const INK_80   = 'rgba(248,247,244,0.80)'
const INK_60   = 'rgba(248,247,244,0.60)'
const INK_55   = 'rgba(248,247,244,0.55)'
const INK_30   = 'rgba(248,247,244,0.30)'
const INK_25   = 'rgba(248,247,244,0.25)'
const HAIR     = 'rgba(248,247,244,0.08)'
const HAIR_STR = 'rgba(248,247,244,0.14)'

/* ── StackChip ──────────────────────────────────────────────────────── */
function StackChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        alignItems: 'center',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: vw(13, 12),
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: INK_60,
        background: 'rgba(255,255,255,0.06)',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '4px',
        paddingBottom: '4px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/* ── PlatformBadge ──────────────────────────────────────────────────── */
function PlatformBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: vw(13, 12),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: INK_55,
      }}
    >
      {label}
    </span>
  )
}

/* ── ExtLink ────────────────────────────────────────────────────────── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: vw(18, 16),
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: INK_55,
        textDecoration: 'none',
        transition: 'color 300ms ease',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = INK_100
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = INK_55
      }}
    >
      <span>{children}</span>
      <span style={{ display: 'inline-block', fontSize: '11px', transition: 'transform 300ms ease' }}>
        ↗
      </span>
    </a>
  )
}

/* ── StudyCta ───────────────────────────────────────────────────────── */
function StudyCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-mono), monospace',
        fontSize: vw(18, 16),
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: INK_80,
        transition: 'color 300ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = INK_100
        const line = el.querySelector<HTMLSpanElement>('[data-line]')
        if (line) line.style.width = '40px'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.color = INK_80
        const line = el.querySelector<HTMLSpanElement>('[data-line]')
        if (line) line.style.width = '20px'
      }}
    >
      <span
        data-line
        style={{
          display: 'block',
          width: '20px',
          height: '1px',
          background: 'currentColor',
          transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
        }}
      />
      제작과정 →
    </button>
  )
}

/* ── MetaRail ───────────────────────────────────────────────────────── */
function MetaRail({ project }: { project: MobileProject }) {
  const labelSize = vw(12, 11)
  const valueSize = vw(13, 12)

  const row = (label: string, value: React.ReactNode, preWrap = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: labelSize,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: INK_25,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: valueSize,
          letterSpacing: '0.10em',
          color: INK_55,
          whiteSpace: preWrap ? 'pre-line' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )

  return (
    <div
      style={{
        width: vw(130, 105),
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '4px',
      }}
      data-reveal
    >
      {/* 인덱스 */}
      <span
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: vw(13, 12),
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: INK_30,
        }}
      >
        {project.index}
      </span>

      {/* Released */}
      {project.releaseDate && row('Released', project.releaseDate)}

      {/* Category */}
      {row('Category', project.category)}

      {/* Platform */}
      {project.platforms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: labelSize,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: INK_25,
            }}
          >
            Platform
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.platforms.map((p) => (
              <PlatformBadge key={p} label={p} />
            ))}
          </div>
        </div>
      )}

      {/* Duration (period) — 신규 */}
      {project.period && row('Duration', project.period)}

      {/* Role — 신규, 줄바꿈 허용 */}
      {project.role && row('Role', project.role, true)}

      {/* Stack chips — 맨 아래 */}
      {project.stack && project.stack.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {project.stack.map((s) => (
            <StackChip key={s} label={s} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── ProjectBody ────────────────────────────────────────────────────── */
function ProjectBody({
  project,
  onStudyOpen,
}: {
  project: MobileProject
  onStudyOpen: () => void
}) {
  return (
    <div
      style={{
        flex: 1,
        maxWidth: vw(460, 320),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* 워드마크 */}
      <h2
        style={{
          fontFamily: 'var(--font-display), serif',
          fontSize: vw(98, 66),
          fontWeight: 400,
          lineHeight: 0.94,
          letterSpacing: '-0.03em',
          color: INK_100,
          margin: 0,
          marginBottom: '24px',
          wordBreak: 'keep-all',
        }}
        data-reveal
      >
        {project.comingSoon && (
          <span
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: INK_30,
              verticalAlign: 'middle',
              marginLeft: '8px',
            }}
          >
            Coming Soon
          </span>
        )}
        {project.title}
      </h2>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-pretendard), sans-serif',
          fontSize: vw(26, 19),
          fontWeight: 400,
          lineHeight: 1.55,
          color: INK_60,
          margin: 0,
          marginBottom: project.uxIntent ? '28px' : '40px',
        }}
        data-reveal
      >
        {project.tagline}
      </p>

      {/* uxIntent — hairline + 인용구 (신규) */}
      {project.uxIntent && (
        <div style={{ marginBottom: '40px' }} data-reveal>
          <div
            style={{
              width: vw(20, 16),
              height: '1px',
              background: HAIR_STR,
              marginBottom: '12px',
            }}
            aria-hidden
          />
          <p
            style={{
              fontFamily: 'var(--font-pretendard), sans-serif',
              fontSize: vw(14, 13),
              fontWeight: 400,
              lineHeight: 1.6,
              color: INK_60,
              margin: 0,
            }}
          >
            {project.uxIntent}
          </p>
        </div>
      )}

      {/* CTA 묶음 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-reveal>
        {project.studyHref && <StudyCta onClick={onStudyOpen} />}
        {project.downloadLinks.playStore && (
          <ExtLink href={project.downloadLinks.playStore}>Google Play</ExtLink>
        )}
        {project.downloadLinks.appStore && (
          <ExtLink href={project.downloadLinks.appStore}>App Store</ExtLink>
        )}
        {project.downloadLinks.web && (
          <ExtLink href={project.downloadLinks.web}>웹/앱 바로가기</ExtLink>
        )}
        {project.downloadLinks.landingPage && (
          <ExtLink href={project.downloadLinks.landingPage}>랜딩페이지 바로가기</ExtLink>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   AppPage — 메인 export
   ══════════════════════════════════════════════════════════════════════ */
interface AppPageProps {
  project: MobileProject
  /** 0-based 페이지 인덱스 (전체 페이지 기준) */
  pageIndex: number
  /** 전체 페이지 수 */
  total: number
  /** 다음 페이지 있음 여부 */
  hasNext?: boolean
  /** 다음 페이지 콜백 */
  onNext?: () => void
}

export function AppPage({
  project,
  pageIndex,
  total,
  hasNext = false,
  onNext,
}: AppPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const pageLabel = String(pageIndex + 1).padStart(2, '0')
  const totalLabel = String(total).padStart(2, '0')

  return (
    <>
      <div
        data-page={pageIndex}
        style={{
          width: '50%',
          height: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
        }}
        aria-label={`${project.title} 앱 소개`}
      >
        {/* ── 상단 spacer — Nav 자리 + 본체 수직 균형 (하단 row 와 대칭) ── */}
        <div
          style={{ height: 'clamp(60px, 6.5vh, 88px)', flexShrink: 0 }}
          aria-hidden
        />

        {/* ── 본체 — 좌:폰 우:정보 ─────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* 좌 페이지 — 폰 mock */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 'clamp(56px, 6vw, 112px)',
              paddingRight: 'clamp(32px, 3vw, 56px)',
              paddingBlock: 'clamp(80px, 8vh, 120px)',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
            data-reveal
          >
            <PhoneMockup project={project} maxHeight="78vh" dimmed={false} />
          </div>

          {/* 책등 hairline — 60vh, 수직 중앙 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1px',
              height: '60vh',
              background: HAIR,
              pointerEvents: 'none',
            }}
          />

          {/* 우 페이지 — meta + body */}
          <div
            style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 'clamp(32px, 3vw, 56px)',
              paddingRight: 'clamp(56px, 6vw, 112px)',
              paddingBlock: 'clamp(80px, 8vh, 120px)',
              boxSizing: 'border-box',
              flexShrink: 0,
              gap: 'clamp(56px, 4vw, 96px)',
            }}
          >
            <MetaRail project={project} />
            <ProjectBody project={project} onStudyOpen={() => setDrawerOpen(true)} />
          </div>
        </div>

        {/* ── bottom row — 화살표만 (→ 다음 페이지 / ↓ 마지막) ──────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            paddingLeft: 'clamp(56px, 6vw, 112px)',
            paddingRight: 'clamp(56px, 6vw, 112px)',
            paddingTop: '20px',
            paddingBottom: 'clamp(32px, 3.5vh, 48px)',
            flexShrink: 0,
          }}
          data-reveal
        >
          {hasNext && onNext ? (
            <button
              onClick={onNext}
              aria-label="다음 페이지"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '20px',
                color: INK_55,
                transition: 'color 200ms ease, transform 200ms ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = INK_100
                el.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = INK_55
                el.style.transform = 'translateX(0)'
              }}
            >
              →
            </button>
          ) : (
            <span
              aria-hidden
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '20px',
                color: INK_55,
              }}
            >
              ↓
            </span>
          )}
        </div>
      </div>

      {/* StudyDrawer — AppPage 자체 관리 */}
      {project.studyHref && (
        <StudyDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          src={project.studyHref}
          title={project.title}
        />
      )}
    </>
  )
}

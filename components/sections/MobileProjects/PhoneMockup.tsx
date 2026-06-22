'use client'

import type { MobileProject } from '@/lib/types/mobile-project'
import { useRef, useState } from 'react'

interface PhoneMockupProps {
  project: MobileProject
  /** true → opacity 0.55 + brightness 0.85 (side 카드용) */
  dimmed?: boolean
  /** clamp() 또는 px 값 — 너비를 외부에서 제어 (width 기준) */
  width?: string
  /** '70vh' 형식 — 높이 기준으로 제어 시 사용. width 보다 우선 */
  maxHeight?: string
}

/**
 * PhoneMockup — 9:19.5 비율 폰 프레임.
 *
 * 레이어:
 *   1. 썸네일 div (backgroundImage cover) — 항상 풀스크린
 *   2. video — *클릭* 시 재생/일시정지 토글 (마우스 떠나도 계속 재생)
 *   3. hint 라벨 ("▶ Click to play") — 재생 전까지 표시, 재생 중 fade-out
 *
 * 클릭 토글 이유(CEO 2026-06-22): hover 재생은 마우스가 떠나면 멈춰 시청 경험이 끊김.
 */
export function PhoneMockup({ project, dimmed = false, width, maxHeight }: PhoneMockupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hover, setHover] = useState(false)

  function toggle() {
    const v = videoRef.current
    if (!project.previewVideo || !v) return
    if (v.paused) {
      v.play().catch(() => {})
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const interactive = !!project.previewVideo

  return (
    <div
      onClick={interactive ? toggle : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? `${project.title} 미리보기 영상 ${playing ? '일시정지' : '재생'}`
          : undefined
      }
      aria-pressed={interactive ? playing : undefined}
      style={{
        ...(maxHeight
          ? {
              height: maxHeight,
              width: 'auto',
              aspectRatio: '9 / 19.5',
              maxWidth: '100%',
            }
          : {
              width: width ?? 'clamp(160px, 18vw, 320px)',
              aspectRatio: '9 / 19.5',
            }),
        position: 'relative',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '1px solid rgba(248,247,244,0.18)',
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? 'brightness(0.85)' : undefined,
        flexShrink: 0,
        background: '#111',
        cursor: interactive ? 'pointer' : 'default',
      }}
      data-phone-mockup
      data-project-id={project.id}
    >
      {/* 항상 풀스크린 썸네일 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${project.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        role="img"
        aria-label={`${project.title} 썸네일`}
      />

      {/* 클릭 시 재생되는 video (재생 중 fade-in, 마우스 떠나도 유지) */}
      {project.previewVideo && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`${project.title} 미리보기`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            opacity: playing ? 1 : 0,
            transition: 'opacity 300ms ease',
            pointerEvents: 'none',
            transform: project.videoZoom ? `scale(${project.videoZoom})` : undefined,
            transformOrigin: 'center',
          }}
        >
          <source src={project.previewVideo} type="video/mp4" />
        </video>
      )}

      {/* 중앙 플레이 글리프 — 박스·글라스 X, 맨 ▶/⏸ + 그림자(대비). 재생 중 fade-out, 호버 시 ⏸ */}
      {project.previewVideo && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(248,247,244,0.95)',
            fontSize: 'clamp(30px, 3vw, 46px)',
            lineHeight: 1,
            letterSpacing: playing ? '0.12em' : '0',
            textShadow: '0 2px 18px rgba(0,0,0,0.6)',
            paddingLeft: playing ? '0' : '4px',
            opacity: playing && !hover ? 0 : 1,
            transition: 'opacity 300ms ease',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {playing ? '❚❚' : '▶'}
        </span>
      )}
    </div>
  )
}

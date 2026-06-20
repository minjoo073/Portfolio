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
 *   1. 썸네일 div (backgroundImage cover) — 항상 풀스크린 표시
 *   2. video — 호버 시 fade-in 으로 위로 겹쳐 재생. 호버 해제 시 fade-out + pause + reset.
 *      영상은 9:16 비율이라 contain + bottom 으로 표시되어 상단은 자연 검은 영역.
 */
export function PhoneMockup({ project, dimmed = false, width, maxHeight }: PhoneMockupProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovered, setHovered] = useState(false)

  function handleEnter() {
    if (!project.previewVideo) return
    setHovered(true)
    videoRef.current?.play().catch(() => {})
  }

  function handleLeave() {
    if (!project.previewVideo) return
    setHovered(false)
    const v = videoRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
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
        cursor: project.previewVideo ? 'pointer' : 'default',
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

      {/* 호버 시 fade-in video */}
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
            opacity: hovered ? 1 : 0,
            transition: 'opacity 300ms ease',
            pointerEvents: 'none',
            transform: project.videoZoom ? `scale(${project.videoZoom})` : undefined,
            transformOrigin: 'center',
          }}
        >
          <source src={project.previewVideo} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

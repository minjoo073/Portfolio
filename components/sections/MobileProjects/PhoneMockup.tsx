'use client'

import type { MobileProject } from '@/lib/types/mobile-project'
import { useEffect, useRef, useState } from 'react'

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
 * - previewVideo 있으면 <video autoPlay loop muted playsInline> cover
 * - 없으면 thumbnail 이미지 cover (404 시 검은 박스)
 * - dimmed: opacity 0.55 + brightness 0.85
 * - 3D hover (featured, !dimmed 에서만): perspective(1200px) rotateX/Y ±12deg + scale 1.04
 */
export function PhoneMockup({ project, dimmed = false, width, maxHeight }: PhoneMockupProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [hovered, setHovered] = useState(false)

  const enableTilt = !dimmed

  useEffect(() => {
    if (!enableTilt) return
    const el = wrapperRef.current
    if (!el) return

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)   // -1 ~ 1
      const dy = (e.clientY - cy) / (rect.height / 2)  // -1 ~ 1
      setTilt({ rx: -dy * 12, ry: dx * 12 })
    }

    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [enableTilt])

  function handleMouseEnter() {
    if (enableTilt) setHovered(true)
  }
  function handleMouseLeave() {
    if (enableTilt) {
      setHovered(false)
      setTilt({ rx: 0, ry: 0 })
    }
  }

  const transform = enableTilt && hovered
    ? `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.04)`
    : 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)'

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        borderRadius: '2rem',
        overflow: 'hidden',
        border: '1px solid rgba(248,247,244,0.18)',
        transform,
        transition: hovered
          ? 'transform 80ms linear'
          : 'transform 600ms cubic-bezier(0.22,0.61,0.36,1)',
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? 'brightness(0.85)' : undefined,
        willChange: 'transform',
        flexShrink: 0,
        background: '#111',
      }}
      data-phone-mockup
      data-project-id={project.id}
    >
      {project.previewVideo ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={project.thumbnail}
          aria-label={`${project.title} 미리보기`}
        >
          <source src={project.previewVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url(${project.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label={`${project.title} 썸네일`}
        />
      )}
    </div>
  )
}

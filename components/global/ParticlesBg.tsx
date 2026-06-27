'use client'

/**
 * ParticlesBg — 별가루 배경 (particles.js)
 * page 레벨 fixed z-10000, IntroOverlay sphere 위와 Hero PORTFOLIO 글자 위에도
 * 떠다님. 인트로 sphere 사라진 후에도 그대로 유지.
 * prefers-reduced-motion = 자동 스킵.
 */

import { useEffect } from 'react'

declare global {
  interface Window {
    particlesJS?: (id: string, cfg: unknown) => void
  }
}

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768

export function ParticlesBg() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const init = () => {
      if (!window.particlesJS) return
      window.particlesJS('cf-stars', {
        particles: {
          number: { value: IS_MOBILE ? 150 : 300, density: { enable: true, value_area: 950 } },
          color: { value: '#838384' },
          shape: { type: 'circle' },
          opacity: {
            value: 0.55, random: true,
            anim: { enable: true, speed: 1.1, opacity_min: 0.12, sync: false },
          },
          size: {
            value: 1.65, random: true,
            anim: { enable: true, speed: 2.0, size_min: 0.55, sync: false },
          },
          line_linked: { enable: false },
          move: {
            enable: true, speed: 0.48, direction: 'none', random: true,
            straight: false, out_mode: 'out', bounce: false,
          },
        },
        interactivity: {
          detect_on: 'window',
          events: { onhover: { enable: false }, onclick: { enable: false }, resize: true },
        },
        retina_detect: true,
      })
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-cf-particles]')
    if (existing && window.particlesJS) {
      init()
      return
    }
    if (existing) {
      existing.addEventListener('load', init, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
    script.async = true
    script.setAttribute('data-cf-particles', '1')
    script.onload = init
    document.body.appendChild(script)
  }, [])

  return (
    <div
      id="cf-stars"
      aria-hidden="true"
      style={{
        // absolute → 부모(Hero section) 영역 안에서만 떠다님 + 그 안 콘텐츠보다 아래 (z-0)
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

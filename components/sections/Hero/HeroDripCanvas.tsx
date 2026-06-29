'use client'

/**
 * HeroDripCanvas — WebGL shader drip 효과 (글자가 액체처럼 녹아내림)
 *
 * canvas 2d 로 "PORTFOLIO" 글자 texture 생성 → Three.js plane mesh + shader 적용.
 * vertex shader = uProgress 따라 y 음수 displacement (drip drop) + noise.
 * fragment shader = texture + alpha fade.
 *
 * 사용:
 *   <HeroDripCanvas progressRef={progressRef} visible={visible} />
 *   - progressRef.current = 0~1 (scroll progress)
 *   - visible = canvas mount/show toggle
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const VERTEX_SHADER = `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  // simplex-like noise (간단 cheap)
  float noise(vec2 p) {
    return sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // drip 강도 = uProgress (0~1). 글자 bottom 부분이 더 많이 늘어남.
    float dripWeight = (1.0 - vUv.y);  // 위 = 0, 아래 = 1
    float dripBase = dripWeight * uProgress * 1.5;

    // x position 따라 drip 변동 (글자별 다른 drop 길이)
    float xNoise = sin(vUv.x * 18.0 + uTime * 0.5) * 0.5 + 0.5;
    float dripVar = mix(0.6, 1.4, xNoise);

    // y 음수 방향 displacement (drip 흘러내림)
    pos.y -= dripBase * dripVar;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    // 액체 진행 따라 alpha fade (마지막에 사라짐)
    float fadeStart = 0.7;
    float alpha = color.a;
    if (uProgress > fadeStart) {
      alpha *= 1.0 - smoothstep(fadeStart, 1.0, uProgress);
    }

    gl_FragColor = vec4(color.rgb, alpha);
  }
`

interface Props {
  /** 0~1 — scroll progress (Hero.tsx 에서 ScrollTrigger onUpdate 로 set) */
  progressRef: React.MutableRefObject<number>
  visible: boolean
}

export function HeroDripCanvas({ progressRef, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    /* ── canvas 2d 로 PORTFOLIO 글자 그리기 (texture 용) ─────────── */
    const textCanvas = document.createElement('canvas')
    const TEXT_W = 2400
    const TEXT_H = 600
    textCanvas.width = TEXT_W
    textCanvas.height = TEXT_H
    const ctx = textCanvas.getContext('2d')!
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.clearRect(0, 0, TEXT_W, TEXT_H)
    ctx.fillStyle = '#0A0A0A'
    ctx.font = '900 540px ui-sans-serif, system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PORTFOLIO', TEXT_W / 2, TEXT_H / 2)

    const texture = new THREE.CanvasTexture(textCanvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    /* ── Three.js scene ─────────────────────────────────────────── */
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    /* ── plane mesh (글자 비율) ─────────────────────────────────── */
    const aspect = TEXT_W / TEXT_H  // 4:1
    const geometry = new THREE.PlaneGeometry(2 * aspect, 2, 64, 24)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTexture: { value: texture },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    /* ── resize ─────────────────────────────────────────────────── */
    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      // camera frustum = container aspect 에 맞춰 plane 크기 조정
      const containerAspect = w / h
      if (containerAspect > aspect) {
        // 가로가 더 넓음 → plane width = container, height 비례
        camera.left = -aspect
        camera.right = aspect
        camera.top = 1
        camera.bottom = -1
      } else {
        // 세로가 더 큼 → plane height = container, width 비례
        const scaleH = aspect / containerAspect
        camera.left = -aspect
        camera.right = aspect
        camera.top = scaleH
        camera.bottom = -scaleH
      }
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener('resize', onResize)

    container.appendChild(renderer.domElement)

    /* ── render loop ────────────────────────────────────────────── */
    const startTime = performance.now()
    function render() {
      rafRef.current = requestAnimationFrame(render)
      material.uniforms.uTime.value = (performance.now() - startTime) / 1000
      material.uniforms.uProgress.value = progressRef.current
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      texture.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [progressRef])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        // h1 위치 (fixed inset-x-0 bottom-[4vh] + fontSize 17.5vw) 와 매치
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '4vh',
        // 높이 = fontSize (17.5vw) + drip 흘러내림 여유 (아래로 30vh)
        height: '47vh',
        marginBottom: '-30vh',  // drip 가 viewport bottom 너머로 흘러내림
        zIndex: 30,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    />
  )
}

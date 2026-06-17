'use client'

/**
 * TitleLiquid — Three.js WebGL 타이틀 액체 굴절.
 *
 * 인터랙션 헌법 3조 예외: Hero 타이틀 한정 WebGL 허용 (CEO 승인 2026-06-17).
 *
 * 효과:
 *   - 가로 우세 noise displacement (액체 스미어)
 *   - 마우스 중심 원형 렌즈 굴절 + 약간 확대
 *   - 엣지 light bloom 띠
 *   - 마우스 이동 속도에 따른 스미어 강도 변조
 *
 * 폴백:
 *   - WebGL 컨텍스트 실패 → console.error + 조용히 종료 (h1 폴백이 보임)
 *   - 모바일/reduced → Hero.tsx 에서 미마운트
 */

import { useEffect, useRef } from 'react'

// ─── Shaders ─────────────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */`
  precision highp float;

  uniform sampler2D uTexture;
  uniform float     uTime;
  uniform vec2      uMouse;
  uniform float     uVel;
  uniform float     uAspect;

  varying vec2 vUv;

  void main() {
    /* ── 원형 렌즈 굴절 (국소만 — 렌즈 밖 원본 100% 그대로) ──────── */
    /* aspect 보정: 화면에서 진짜 원형으로 보이도록 */
    vec2  toMouse = vec2((vUv.x - uMouse.x) * uAspect, vUv.y - uMouse.y);
    float dist    = length(toMouse);
    float lensR   = 0.20;  /* 오브제 크기감에 맞춤 */

    /* smoothstep 경계: lensR*0.72 안쪽 full, lensR 바깥 0 — 부드러운 페이드 */
    float lensW = 1.0 - smoothstep(lensR * 0.72, lensR, dist);

    vec2 uv = vUv;  /* 기본: 원본 UV 그대로 */

    if (lensW > 0.001) {
      /* 볼록렌즈 프리즘: 엣지 굴절 강함, 중심 약함 */
      float edgeFactor = dist / lensR;                       /* 0=center, 1=edge */
      float refractAmt = 0.060 * lensW * (0.3 + edgeFactor * 0.7);

      vec2 dir = (dist > 0.001)
        ? normalize(toMouse) / vec2(uAspect, 1.0)
        : vec2(0.0);
      uv += dir * refractAmt;

      /* 중심 약한 확대 */
      float centerBulge = lensW * lensW * 0.08;
      uv = uMouse + (uv - uMouse) * (1.0 - centerBulge);

      /* 렌즈 내부 미세 shimmer — uTime 은 여기서만, 위치 영향 최소 */
      float shimmer = sin(uTime * 2.1 + dist * 15.0) * 0.0025 * lensW;
      uv.x += shimmer;
    }

    vec2 clampedUv = clamp(uv, 0.0, 1.0);
    vec4 texColor  = texture2D(uTexture, clampedUv);

    /* ── Light bloom (렌즈 영역 안에서만) ───────────────────────────── */
    float s1 = 0.0030;
    float s2 = 0.0070;
    float b1 = texture2D(uTexture, clamp(uv + vec2(s1, 0.0), 0.0, 1.0)).a;
    float b2 = texture2D(uTexture, clamp(uv - vec2(s1, 0.0), 0.0, 1.0)).a;
    float b3 = texture2D(uTexture, clamp(uv + vec2(s2, 0.0), 0.0, 1.0)).a;
    float b4 = texture2D(uTexture, clamp(uv - vec2(s2, 0.0), 0.0, 1.0)).a;
    float bloomAlpha = (b1 + b2 + b3 + b4) * 0.25;

    float edgeBloom = max(bloomAlpha - texColor.a, 0.0) * 0.50 * lensW;
    vec3  bloomCol  = vec3(0.52, 0.52, 0.58);  /* 쿨톤 연보라빛 */

    vec3  finalColor = mix(texColor.rgb, bloomCol, edgeBloom);
    float finalAlpha = max(texColor.a, bloomAlpha * 0.36 * lensW);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

// ─── Canvas2D 텍스처 빌더 ─────────────────────────────────────────────────────

function buildTextCanvas(
  w: number,
  h: number,
  dpr: number
): HTMLCanvasElement {
  const tc  = document.createElement('canvas')
  tc.width  = Math.floor(w * dpr)
  tc.height = Math.floor(h * dpr)

  const ctx = tc.getContext('2d')
  if (!ctx) return tc

  ctx.clearRect(0, 0, tc.width, tc.height)
  ctx.scale(dpr, dpr)

  const TITLE = 'PORTFOLIO'
  /* px-side-d = 64px, px-side-t = 40px, px-side-m = 20px */
  const paddingX  = w >= 1280 ? 64 : w >= 768 ? 40 : 20
  /* h1 top-[18%] */
  const textY     = h * 0.18
  /* 가용 폭 — 글자수 늘어도(PORTFOLIO 9자) 안 잘리게 fit-to-width */
  const maxTextWidth = w - paddingX * 2

  /* 폰트+letterSpacing 일괄 적용 (letterSpacing 은 fontSize 비례) */
  const applyFont = (size: number) => {
    ctx.font = `900 ${size}px Inter, sans-serif`
    /* letterSpacing: Chrome 99+, FF 118+, Safari 17.2+ */
    if ('letterSpacing' in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        `${(-0.04 * size).toFixed(2)}px`
    }
  }

  /* 기준: text-display-xl clamp(72px,19vw,360px). 측정 후 폭 넘치면 비례 축소 */
  let fontSize = Math.max(72, Math.min(0.19 * w, 360))
  applyFont(fontSize)
  const measured = ctx.measureText(TITLE).width
  if (measured > maxTextWidth) {
    fontSize = fontSize * (maxTextWidth / measured)
    applyFont(fontSize)
  }

  ctx.fillStyle     = '#111111'
  ctx.textBaseline  = 'top'
  ctx.fillText(TITLE, paddingX, textY)
  return tc
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

interface TitleLiquidProps {
  className?: string
}

export function TitleLiquid({ className }: TitleLiquidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let isDestroyed = false
    let disposeAll: (() => void) | null = null

    ;(async () => {
      /* 동적 import — three 를 초기 번들에서 분리 */
      const THREE = await import('three')
      if (isDestroyed) return

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      /* ── Renderer ──────────────────────────────────────────────── */
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      } catch (e) {
        console.error('[TitleLiquid] WebGLRenderer 생성 실패 — h1 폴백 사용:', e)
        return
      }
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h)
      renderer.setClearColor(0x000000, 0)

      /* ── Scene / Camera ────────────────────────────────────────── */
      const scene  = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      /* ── 폰트 로드 후 텍스처 그리기 ──────────────────────────── */
      try {
        await document.fonts.load('900 100px Inter')
        await document.fonts.ready
      } catch (e) {
        console.warn('[TitleLiquid] 폰트 로드 경고 (fallback 사용):', e)
      }
      if (isDestroyed) { renderer.dispose(); return }

      /* ── Canvas2D 텍스처 ──────────────────────────────────────── */
      const makeTexture = (cw: number, ch: number, cdpr: number) => {
        const tc = buildTextCanvas(cw, ch, cdpr)
        const tx = new THREE.CanvasTexture(tc)
        tx.minFilter = THREE.LinearFilter
        tx.magFilter = THREE.LinearFilter
        return tx
      }

      let texture = makeTexture(w, h, dpr)

      /* ── Uniforms ─────────────────────────────────────────────── */
      const uniforms = {
        uTexture: { value: texture },
        uTime:    { value: 0 },
        uMouse:   { value: new THREE.Vector2(0.73, 0.63) },
        uVel:     { value: 0 },
        uAspect:  { value: w / h }
      }

      /* ── Mesh ──────────────────────────────────────────────────── */
      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent:    true,
        depthWrite:     false
      })
      scene.add(new THREE.Mesh(geometry, material))

      /* ── 마우스 추종 ──────────────────────────────────────────── */
      /* 초기값: 프레임 초기 위치(right 8vw, top 18%) 중심에 렌즈 정렬 */
      const mouseCurrent = new THREE.Vector2(0.73, 0.63)
      const mouseTarget  = new THREE.Vector2(0.73, 0.63)
      const mousePrev    = new THREE.Vector2(0.73, 0.63)
      let velSmoothed    = 0

      const handlePointerMove = (e: PointerEvent) => {
        const rect   = canvas.getBoundingClientRect()
        mouseTarget.x = (e.clientX - rect.left) / rect.width
        mouseTarget.y = 1.0 - (e.clientY - rect.top) / rect.height
      }
      window.addEventListener('pointermove', handlePointerMove, { passive: true })

      /* ── 리사이즈 ─────────────────────────────────────────────── */
      const handleResize = () => {
        const nw = canvas.offsetWidth
        const nh = canvas.offsetHeight
        if (nw === 0 || nh === 0) return
        const ndpr = Math.min(window.devicePixelRatio || 1, 2)
        renderer.setSize(nw, nh)
        uniforms.uAspect.value = nw / nh
        texture.dispose()
        texture = makeTexture(nw, nh, ndpr)
        uniforms.uTexture.value = texture
      }
      window.addEventListener('resize', handleResize, { passive: true })

      /* ── RAF 루프 ─────────────────────────────────────────────── */
      const clock = new THREE.Clock()
      let rafId: number | null = null

      const tick = () => {
        if (isDestroyed) return
        rafId = requestAnimationFrame(tick)

        /* 마우스 lerp */
        mouseCurrent.lerp(mouseTarget, 0.08)
        uniforms.uMouse.value.copy(mouseCurrent)

        /* 속도 */
        const vel      = mouseCurrent.distanceTo(mousePrev) * 40
        velSmoothed   += (vel - velSmoothed) * 0.12
        uniforms.uVel.value = Math.min(velSmoothed, 1.5)
        mousePrev.copy(mouseCurrent)

        uniforms.uTime.value = clock.getElapsedTime()
        renderer.render(scene, camera)
      }
      rafId = requestAnimationFrame(tick)

      /* ── 정리 클로저 ──────────────────────────────────────────── */
      disposeAll = () => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('resize', handleResize)
        geometry.dispose()
        material.dispose()
        texture.dispose()
        renderer.dispose()
      }
    })().catch(err => {
      console.error('[TitleLiquid] 설정 실패 — h1 폴백 사용:', err)
    })

    return () => {
      isDestroyed = true
      disposeAll?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}

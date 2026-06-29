'use client'

/**
 * IntroOverlay — cubiflow.com 3D Globe Intro + 박민주 매치컷.
 *
 * PHASE 1  LOADING  (FORCE_LOADING_MS=800ms)
 *   — sphere scale startScale, opacity 0, 로더 3박스 깜빡임
 * PHASE 2  FILL     (1200ms easeInOutCubic)
 *   — sphere opacity 0→1, 로더 opacity 1→0
 * PHASE 3  ZOOM     (1500ms easeOutQuint)
 *   — sphere scale startScale→1
 * PHASE 4  SCROLL   — wheel/touch → 구체 회전 관성
 *   — 누적 720° 도달 → sphere translateY -100vh + opacity 0 (0.6s) → exitEnd
 * PHASE 5  DONE     — unmount → Hero PORTFOLIO 떨어짐 시작
 *
 * prefers-reduced-motion: 즉시 Hero.
 * 배경: 항상 #EBEBEB (Hero bg-hero-bg 와 매치컷, 색 점프 0).
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useLenis } from '@/lib/hooks/useLenis'

/* ── 상수 ───────────────────────────────────────────────────────────── */
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768
// cubiflow 카드 직역 — 작은 가로 카드 (16:9 비율), 표면에 점점이 분포
const COUNT = IS_MOBILE ? 100 : 180
const GLOBE_RADIUS = 6.8
const GLOBE_ITEM_W = 0.9  // 더 키움 (0.75 → 0.9, 약 20% 추가)
const FIXED_RATIO = 0.6  // h/w — 0.6 = 가로형 (대략 16:10), cubiflow 매치
// 카메라 거리 — 텍스트 사이 여백 확보하되 sphere 적당히 크게
const CAMERA_GLOBE_Z = 17

// Phase 1: cursor blink → typewriter → 풀네임 인지 → Phase A1 좌우 압축 → A2 점 완성 → Phase B 뒤로 빠짐 + sphere cross
const FORCE_LOADING_MS = 4000  // Phase B 시작 = sphere FILL 시작 (천천히, 자연 cross)
const FILL_DUR = 850   // sphere fade in 살짝 빠르게 (1000 → 850)
const ZOOM_DUR = 2200  // scale START_SCALE → 1 천천히 (서서히 커짐)

// 구체 회전 물리
const WHEEL_TO_VEL  = 0.0008
const TOUCH_TO_VEL  = 0.0018
const DAMP_GLOBE    = 0.965
const SMOOTH_LERP   = 0.08
const MAX_VEL_GLOBE = 0.018

// 스크롤 = camera z 감소 (카메라가 sphere 안으로 진입 — perspective 로 카드 vanishing point 향해 사라짐)
// EXIT_Z = sphere 안 깊이 (radius 6.8 < EXIT_Z 1.5 → sphere 깊이 ~5 진입). Z_FACTOR 작게 = 천천히 = 공간 즐김.
const EXIT_Z = 1.5
const Z_FACTOR = 12

// sphere 시작 스케일 — ○ 마커 크기 정도로 매우 작게
// (cubiflow: startScale = remPx / finalDiamPx clamp(0.02~0.22))
// → ○ fade out 과 sphere fade in 이 *같은 자리에서* 일어나며
//    "○ 안에서 sphere 가 피어남" 인상.
const START_SCALE = 0.015  // 시작 스케일 더 작게 — ○ 마커 안 점 크기 (점에서 자라남)

// 박민주 캡처 — public/captures/01.webp ~ 45.webp (45장, WebP q75 width 1200).
// COUNT(180) 슬롯에 modulo 로 반복 배치 — 한 캡처 약 4번 등장.
// PNG 108MB → WebP 1.4MB (99% 절감, 인트로 로딩 속도 개선)
const RAW_CAPTURES = Array.from({ length: 45 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return `/captures/${n}.webp`
})
const demoImages = Array.from({ length: COUNT }, (_, i) => ({
  src: RAW_CAPTURES[i % RAW_CAPTURES.length],
}))

/* ── 이징 함수 ──────────────────────────────────────────────────────── */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

/* ── Fibonacci sphere 포지션 생성 ───────────────────────────────────── */
function buildEvenGlobePositions(count: number, radius: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const y = (1 - 2 * t) * radius
    const r = Math.sqrt(Math.max(0, radius * radius - y * y))
    const phi = goldenAngle * i
    positions.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
  }
  return positions
}

/* ── 타임라인 애니메이터 ─────────────────────────────────────────────
 * requestAnimationFrame 기반 단일 타임라인 러너.
 * onUpdate(t: 0→1), onComplete 콜백.
 */
function runTimeline(
  duration: number,
  easeFn: (t: number) => number,
  onUpdate: (t: number) => void,
  onComplete?: () => void,
): () => void {
  const start = performance.now()
  let raf: number
  function tick(now: number) {
    const elapsed = now - start
    const raw = Math.min(elapsed / duration, 1)
    const t = easeFn(raw)
    onUpdate(t)
    if (raw < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onComplete?.()
    }
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

/* ── 로더 컴포넌트 (cursor + typewriter "PARK MINJOO")
 *   빈 캔버스 + cursor blink → 이름 한 글자씩 천천히 입력 → 풀네임 후 자연 cross fade → sphere.
 *   2.4s 시퀀스:
 *     0~0.4s   cursor blink (입력 전 대기)
 *     0.4~2.1s typewriter "PARK MINJOO" (11 글자 × ~155ms — 한 글자씩 명확)
 *     2.1~2.4s 풀네임 → cross fade (sphere fade in 과 overlap)
 */
function Loader({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 18,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '0.08em',
          color: '#1A1A1A',
          transformOrigin: '50% 50%',
          animation: 'cfLoaderFade 4.6s linear forwards',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            animation: 'cfTyping 2.5s steps(11, end) 0.4s both',
          }}
        >
          PARK MINJOO
        </span>
        <span
          style={{
            position: 'absolute',
            left: 'calc(100% + 4px)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: 20,
            backgroundColor: '#1A1A1A',
            animation: 'cfCursorBlink 0.5s steps(2) infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes cfTyping {
          from { width: 0 }
          to   { width: 12.5ch }
        }
        @keyframes cfCursorBlink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes cfLoaderFade {
          /* 0~66% (0~3.1s) typewriter + 인지 — 정적 */
          0%, 66%   { opacity: 1; transform: scaleX(1) scaleY(1); animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }
          /* 66~79% (3.1~3.7s, 0.6s) Phase A1 — 좌우 수평 압축 (천천히 글자가 가운데로 모임) */
          79%       { opacity: 1; transform: scaleX(0.02) scaleY(1); animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }
          /* 79~85% (3.7~4.0s, 0.3s) Phase A2 — 위아래 압축 (점 완성) */
          85%       { opacity: 1; transform: scaleX(0.02) scaleY(0.05); animation-timing-function: cubic-bezier(0.33, 0, 0.67, 1); }
          /* 87~100% (4.0~4.6s, 0.6s) Phase B — 점이 뒤로 빠지며 fade out (살짝 빠르게, sphere cross) */
          87%       { opacity: 1; transform: scaleX(0.02) scaleY(0.05); }
          100%      { opacity: 0; transform: scaleX(0) scaleY(0); }
        }
      `}</style>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Chrome — cubiflow chrome 직역 (상단 로고, 코너 마커, 하단 메뉴)
   sphere ZOOM 완료 후 slide-in (900ms cubic-bezier(0.16, 1, 0.3, 1))
   exit 시작 시 reverse slide (cubiflow Nav/Bottom 모션 매치)
══════════════════════════════════════════════════════════════════════ */
function Chrome({ visible }: { visible: boolean }) {
  const EASE  = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const DUR   = 900
  const STROKE = '#111111'

  const baseTextStyle: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: STROKE,
    userSelect: 'none',
    pointerEvents: 'none',
  }

  return (
    <>
      {/* ── 상단 중앙 — "MINJOO PARK" (underline) ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: visible
            ? 'translate(-50%, 0)'
            : 'translate(-50%, -160%)',
          opacity: visible ? 1 : 0,
          transition: `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`,
          willChange: 'transform, opacity',
          zIndex: 20,
          ...baseTextStyle,
          textDecoration: 'underline',
          textUnderlineOffset: 4,
        }}
      >
        MINJOO PARK
      </div>

      {/* 좌상단 □ / 우상단 + 폐기 — 박민주 포폴 무관 마커 제거 */}

      {/* ── 하단 좌 — GH NT IG ──────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 24, left: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(160%)',
          transition: `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`,
          willChange: 'transform, opacity',
          zIndex: 20,
          display: 'flex',
          gap: 12,
          ...baseTextStyle,
        }}
      >
        <span>GH</span><span>NT</span><span>IG</span>
      </div>

      {/* 하단 중앙 mail/CONTACT/phone 그룹 폐기 — SCROLL TO ENTER hint 가 그 자리로 이동 */}

      {/* ── 하단 우 — WORK / CONTACT (페이지 main nav 동일) ─────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 24, right: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(160%)',
          transition: `transform ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`,
          willChange: 'transform, opacity',
          zIndex: 20,
          display: 'flex',
          gap: 24,
          ...baseTextStyle,
        }}
      >
        <span>WORK</span>
        <span>CONTACT</span>
      </div>

      {/* ── 좌하단 코너 — [G] (cubiflow 디자인 매칭) ───────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 60, left: 28,
          opacity: visible ? 0.55 : 0,
          transition: `opacity ${DUR}ms ${EASE}`,
          zIndex: 20,
          ...baseTextStyle,
          fontSize: 10,
        }}
      >
        [G]
      </div>

      {/* ── 우하단 코너 — [R] (cubiflow 디자인 매칭) ───────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 60, right: 28,
          opacity: visible ? 0.55 : 0,
          transition: `opacity ${DUR}ms ${EASE}`,
          zIndex: 20,
          ...baseTextStyle,
          fontSize: 10,
        }}
      >
        [R]
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   GlobeScene — Three.js 캔버스 + 스크롤 회전 + exit 애니메이션
══════════════════════════════════════════════════════════════════════ */
interface GlobeSceneProps {
  onZoomComplete: () => void
  onExitStart?: () => void
  onExitComplete: () => void
}

function GlobeScene({ onZoomComplete, onExitStart, onExitComplete }: GlobeSceneProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const wrapperRef   = useRef<HTMLDivElement>(null)

  // Three 오브젝트 refs (re-render 방지)
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef     = useRef<THREE.Scene | null>(null)
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null)
  const groupRef     = useRef<THREE.Group | null>(null)
  const meshesRef    = useRef<THREE.Mesh[]>([])
  const materialRef  = useRef<THREE.MeshBasicMaterial | null>(null)

  // 애니메이션 상태 refs
  const phaseRef        = useRef<'loading' | 'fill' | 'zoom' | 'scroll' | 'exit'>('loading')
  const fillOpacityRef  = useRef(0)   // material opacity
  const scaleRef        = useRef(START_SCALE)
  const velRef          = useRef(0)   // 회전 속도
  const targetVelRef    = useRef(0)
  const accumulatedRef  = useRef(0)   // 누적 회전 라디안
  const lastTouchYRef   = useRef(0)
  const rafRef          = useRef<number>(0)
  const cleanupFillRef  = useRef<(() => void) | null>(null)
  const cleanupZoomRef  = useRef<(() => void) | null>(null)

  // exit 애니메이션 (translateY + opacity)
  const exitProgressRef = useRef(0)

  const startExit = useCallback(() => {
    if (phaseRef.current === 'exit') return
    phaseRef.current = 'exit'
    onExitStart?.()  // chrome 도 동시 fade out 시작
    const wrapper = wrapperRef.current
    if (!wrapper) {
      onExitComplete()
      return
    }
    runTimeline(
      700,
      easeOutQuint,
      (t) => {
        // 사용자 의도: sphere 확대된 채 fade out. 축소 X.
        wrapper.style.opacity = String(1 - t)
        if (window.scrollY !== 0) window.scrollTo(0, 0)
      },
      () => {
        onExitComplete()
      },
    )
  }, [onExitStart, onExitComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /* ── Three 셋업 ────────────────────────────────────────────── */
    // alpha=true → 별가루 (#cf-stars) 가 카드 사이로 보임
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = CAMERA_GLOBE_Z
    cameraRef.current = camera

    const group = new THREE.Group()
    scene.add(group)
    groupRef.current = group

    /* ── 이미지 카드 메시 생성 ──────────────────────────────────── */
    const positions = buildEvenGlobePositions(COUNT, GLOBE_RADIUS)
    const itemH = GLOBE_ITEM_W * FIXED_RATIO
    const meshes: THREE.Mesh[] = []

    // 공유 material — opacity 로 FILL 애니메이션 제어
    // side: DoubleSide 핵심 — sphere 뒷면 카드도 보이게 (back-face culling 해제)
    const sharedMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
    materialRef.current = sharedMat

    // 텍스처 로딩 — 개별 mesh material 로 swap
    const loader = new THREE.TextureLoader()
    positions.forEach((pos, i) => {
      const geo = new THREE.PlaneGeometry(GLOBE_ITEM_W, itemH)
      const mat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        color: 0xcccccc,
        side: THREE.DoubleSide,  // sphere 전체 카드 보임 (앞+뒤)
      })
      const mesh = new THREE.Mesh(geo, mat)

      // cubiflow 정확 매치 — 카드 normal 이 sphere 표면 *바깥* 향함
      // lookAt(pos * 2) = 중심 반대편 점을 봄 = 표면 법선 방향
      // 이게 sphere 회전 시 각 카드가 *3D 입체* 로 보이는 핵심 (평면 X)
      mesh.position.copy(pos)
      mesh.lookAt(pos.x * 2, pos.y * 2, pos.z * 2)

      group.add(mesh)
      meshes.push(mesh)

      // 텍스처 비동기 로드
      const imgSrc = demoImages[i % demoImages.length].src
      loader.load(
        imgSrc,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          mat.map = texture
          mat.color.set(0xffffff)
          mat.needsUpdate = true
        },
        undefined,
        () => {
          // 실패 시 placeholder 색 유지
        },
      )

      meshesRef.current = meshes
    })

    group.scale.setScalar(START_SCALE)

    /* ── 리사이즈 핸들러 ────────────────────────────────────────── */
    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    /* ── 렌더 루프 ──────────────────────────────────────────────── */
    function render() {
      rafRef.current = requestAnimationFrame(render)

      if (phaseRef.current === 'scroll' || phaseRef.current === 'exit') {
        velRef.current += (targetVelRef.current - velRef.current) * SMOOTH_LERP
        targetVelRef.current *= DAMP_GLOBE
        velRef.current = Math.max(-MAX_VEL_GLOBE, Math.min(MAX_VEL_GLOBE, velRef.current))

        // 양방향 자유 조절 — forward = sphere 안으로 진입, backward = 빠져나옴. EXIT_Z 도달 시 자동 exit.
        if (phaseRef.current === 'scroll') {
          camera.position.z = Math.min(
            CAMERA_GLOBE_Z,
            Math.max(EXIT_Z, camera.position.z - velRef.current * Z_FACTOR)
          )
          if (camera.position.z <= EXIT_Z) {
            startExit()
          }
        }
      }

      // material opacity 동기화 (FILL 타임라인 → fillOpacityRef → 각 mesh mat)
      const op = fillOpacityRef.current
      meshes.forEach((m) => {
        ;(m.material as THREE.MeshBasicMaterial).opacity = op
      })

      // sphere scale 동기화 (ZOOM 타임라인 → scaleRef → group.scale)
      group.scale.setScalar(scaleRef.current)

      renderer.render(scene, camera)
    }
    render()

    /* ── 시퀀스 시작 ────────────────────────────────────────────── */
    phaseRef.current = 'loading'

    const loadingTimer = window.setTimeout(() => {
      // FILL + ZOOM 동시 시작 (parallel) — sphere fade in 과 scale 확대 동시 진행, 멈칫 없음.
      phaseRef.current = 'fill'
      cleanupFillRef.current = runTimeline(
        FILL_DUR,
        easeInOutCubic,
        (t) => {
          fillOpacityRef.current = t
        },
      )
      cleanupZoomRef.current = runTimeline(
        ZOOM_DUR,
        easeOutQuint,
        (t) => {
          scaleRef.current = START_SCALE + (1 - START_SCALE) * t
        },
        () => {
          phaseRef.current = 'scroll'
          onZoomComplete()
        },
      )
    }, FORCE_LOADING_MS)

    /* ── wheel 핸들러 ───────────────────────────────────────────── */
    function onWheel(e: WheelEvent) {
      if (phaseRef.current !== 'scroll') return
      e.preventDefault()
      targetVelRef.current += e.deltaY * WHEEL_TO_VEL
    }

    /* ── touch 핸들러 ───────────────────────────────────────────── */
    function onTouchStart(e: TouchEvent) {
      lastTouchYRef.current = e.touches[0].clientY
    }
    function onTouchMove(e: TouchEvent) {
      if (phaseRef.current !== 'scroll') return
      e.preventDefault()
      const dy = lastTouchYRef.current - e.touches[0].clientY
      lastTouchYRef.current = e.touches[0].clientY
      targetVelRef.current += dy * TOUCH_TO_VEL
    }

    /* ── pointer drag 핸들러 (마우스로 sphere 회전 — 3D 공간 진입 인상) ─── */
    let isDragging = false
    let dragLastX = 0
    let dragLastY = 0
    const DRAG_ROT_FACTOR = 0.005
    function onPointerDown(e: PointerEvent) {
      if (phaseRef.current !== 'scroll') return
      isDragging = true
      dragLastX = e.clientX
      dragLastY = e.clientY
      canvas.style.cursor = 'grabbing'
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return
      const dx = e.clientX - dragLastX
      const dy = e.clientY - dragLastY
      dragLastX = e.clientX
      dragLastY = e.clientY
      group.rotation.y += dx * DRAG_ROT_FACTOR
      group.rotation.x += dy * DRAG_ROT_FACTOR
    }
    function onPointerUp() {
      isDragging = false
      canvas.style.cursor = 'grab'
    }
    canvas.style.cursor = 'grab'

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      clearTimeout(loadingTimer)
      cleanupFillRef.current?.()
      cleanupZoomRef.current?.()
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      renderer.dispose()
      meshes.forEach((m) => {
        m.geometry.dispose()
        ;(m.material as THREE.MeshBasicMaterial).map?.dispose()
        ;(m.material as THREE.MeshBasicMaterial).dispose()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        willChange: 'transform, opacity',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   IntroOverlay — 오케스트레이터
══════════════════════════════════════════════════════════════════════ */
export function IntroOverlay() {
  const [visible, setVisible]           = useState(true)
  const [showLoader, setShowLoader]     = useState(true)
  const [chromeVisible, setChromeVisible] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(1) // exit 시 wrapper 전체 fade
  const [reduced, setReduced]           = useState(false)

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  /* ── reduced motion 감지 ────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setReduced(true)
    }
  }, [])

  /* ── scroll / input lock ────────────────────────────────────── */
  useEffect(() => {
    if (typeof history !== 'undefined') history.scrollRestoration = 'manual'
    document.body.style.overflow    = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    lenisRef.current?.scrollTo(0, { immediate: true, force: true, lock: true, duration: 0 })
    lenisRef.current?.stop()

    const blockScroll = (e: Event) => e.preventDefault()
    window.addEventListener('wheel',     blockScroll, { capture: true, passive: false })
    window.addEventListener('touchmove', blockScroll, { capture: true, passive: false })

    return () => {
      // Hero entrance 완료 이벤트 listener (정확 동기) + 안전 fallback 5000ms
      let removed = false
      const safeRemove = () => {
        if (removed) return
        removed = true
        window.removeEventListener('wheel',     blockScroll, { capture: true } as EventListenerOptions)
        window.removeEventListener('touchmove', blockScroll, { capture: true } as EventListenerOptions)
      }
      window.addEventListener('hero:entranceEnd', safeRemove, { once: true })
      window.setTimeout(safeRemove, 5000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // GlobeScene 자체도 wheel/touchmove를 핸들하므로, 위 blockScroll 은
  // scroll phase 이전(loading/fill/zoom)에만 실질적으로 작동한다.
  // scroll phase 이후 GlobeScene onWheel 이 e.preventDefault() 로 인계.

  /* ── helpers ────────────────────────────────────────────────── */
  function unlock() {
    // Lenis 내부 velocity/target 강제 0 reset (private API) — wheel 누적 사전 차단.
    // RAF 후 scrollTo 폐기 — 사용자 첫 wheel 직후 호출 시 누적 reset 으로 "위로 올라감" 발생.
    const lenis = lenisRef.current as unknown as {
      velocity?: number; animatedScroll?: number; targetScroll?: number;
    } | null
    if (lenis) {
      if (typeof lenis.velocity === 'number') lenis.velocity = 0
      if (typeof lenis.animatedScroll === 'number') lenis.animatedScroll = 0
      if (typeof lenis.targetScroll === 'number') lenis.targetScroll = 0
    }
    lenisRef.current?.scrollTo(0, { immediate: true, force: true, lock: true, duration: 0 })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    document.body.style.overflow    = ''
    document.documentElement.style.overflow = ''
    lenisRef.current?.start()
  }

  function exitNow() {
    unlock()
    window.dispatchEvent(new CustomEvent('intro:exitEnd'))
    setVisible(false)
  }

  /* ── work 페이지에서 뒤로 돌아옴 — 인트로 완전 스킵 + 해당 카드로 스크롤
   * WorkViewer 가 saveReturnTarget() 으로 sessionStorage 에 저장 →
   * 여기서 읽고 인트로 즉시 종료 + 카드 위치로 스크롤
   */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const scrollId = sessionStorage.getItem('postNavScrollId')
    if (!scrollId) return
    // 즉시 unmount + Hero entrance 트리거 (인트로 안 보임)
    sessionStorage.removeItem('postNavScrollId')
    sessionStorage.removeItem('postNavCardSlug')
    setVisible(false)
    window.dispatchEvent(new CustomEvent('intro:exitEnd'))
    // RAF 후 카드 위치로 스크롤 (Hero entrance + page mount 후)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(scrollId)
        if (target) {
          target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' })
        }
        // body overflow 풀기 (mount useEffect 가 lock 했을 수도)
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        lenisRef.current?.start()
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── reduced motion: 즉시 Hero ──────────────────────────────── */
  useEffect(() => {
    if (!reduced) return
    exitNow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  /* ── ESC 스킵 ───────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitNow()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* (별가루는 page 레벨 <ParticlesBg /> 가 담당 — 인트로 unmount 후에도 영구 유지) */

  /* ── ZOOM 완료 콜백 — 로더 숨김 (chrome 는 setTimeout 으로 별도 미리 표시) */
  const handleZoomComplete = useCallback(() => {
    setShowLoader(false)
  }, [])

  /* ── Chrome 시점 분리 — ZOOM 끝 (6.2s) 까지 기다리지 않고 ZOOM 진행 중반(5s)에 미리 slide-in
   * → 사용자 체감 "원 등장 후 텍스트 빠르게" + 마지막 chrome transition 900ms 가 sphere 자라는 동안 진행
   */
  useEffect(() => {
    if (reduced) return
    const t = window.setTimeout(() => setChromeVisible(true), 5000)
    return () => window.clearTimeout(t)
  }, [reduced])

  /* ── sphere exit 시작
   * 0) 누적 wheel 무효화 — page scroll 강제 최상단 (사용자가 wheel 한 양이
   *    lenis target 에 누적되어 unlock 시 점프하는 거 방지)
   * 1) chrome slide-out
   * 2) Hero entrance 즉시 트리거 (PORTFOLIO 글자 떨어짐 시작)
   * 3) IntroOverlay wrapper 전체 fade out (bg + sphere + chrome) →
   *    그 아래 Hero PORTFOLIO 글자가 떨어지는 거 보임
   */
  const handleExitStart = useCallback(() => {
    // 누적 wheel 무효화 — Hero entrance 시 화면이 *Hero section 위치 (0,0)* 에 있어야 글자 떨어짐 처음부터 보임
    lenisRef.current?.scrollTo(0, { immediate: true, force: true, lock: true, duration: 0 })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    setChromeVisible(false)
    window.dispatchEvent(new CustomEvent('intro:exitEnd'))
    setOverlayOpacity(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── sphere exit 완료 → unmount
   * Hero entrance 가 진행 중 (글자 떨어지는 중) 이라 추가 500ms 동안 scroll lock 유지
   * → 사용자가 스크롤해도 페이지 안 움직임 + 글자 정착까지 화면 안정
   */
  const handleExitComplete = useCallback(() => {
    setVisible(false)
    // Hero entrance 완료 이벤트 listener (정확 동기) + 안전 fallback setTimeout 5000ms
    let unlocked = false
    const safeUnlock = () => {
      if (unlocked) return
      unlocked = true
      unlock()
    }
    window.addEventListener('hero:entranceEnd', safeUnlock, { once: true })
    window.setTimeout(safeUnlock, 5000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible || reduced) return null

  return (
    <div
      data-intro-overlay
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#EBEBEB', // Hero bg-hero-bg 매치컷 (그 아래 다른 섹션 덮음)
        overflow: 'hidden',
        // exit 시 wrapper 전체 fade out — bg + sphere + chrome 동시 사라지면서
        // 그 아래 Hero PORTFOLIO 글자가 떨어지는 거 노출
        opacity: overlayOpacity,
        transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: overlayOpacity < 0.5 ? 'none' : 'auto',
      }}
    >
      {/* 별가루는 page 레벨 <ParticlesBg /> 가 z-10000 으로 sphere 위에도 떠다님 */}
      <GlobeScene
        onZoomComplete={handleZoomComplete}
        onExitStart={handleExitStart}
        onExitComplete={handleExitComplete}
      />
      <Loader visible={showLoader} />
      <Chrome visible={chromeVisible} />

      {/* 스크롤 힌트 — ZOOM 완료 후 표시. 하단 중앙 (CONTACT 그룹 폐기 후 그 자리) */}
      {!showLoader && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#111111',
            opacity: 0.55,
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            animation: 'fadeInCue 0.6s ease-out forwards, bounceCue 1.6s ease-in-out infinite',
            zIndex: 21,
          }}
        >
          <span>SCROLL TO ENTER</span>
          <span style={{ fontSize: 14, lineHeight: 1 }}>↓</span>
          <style>{`
            @keyframes fadeInCue {
              from { opacity: 0; }
              to   { opacity: 0.55; }
            }
            @keyframes bounceCue {
              0%, 100% { transform: translate(-50%, 0); }
              50%      { transform: translate(-50%, 6px); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

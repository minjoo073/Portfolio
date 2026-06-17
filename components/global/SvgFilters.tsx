/**
 * 전역 SVG 필터 정의 — 3차 §2.2 Browser Frame 굴절.
 * WebGL 없이 backdrop-filter + feDisplacementMap 으로 미세 굴절감.
 *
 * 페이지에 1회만 mount. 모든 Browser Frame이 `filter: url(#refraction)` 으로 reuse.
 */
export function SvgFilters() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    >
      <defs>
        {/*
          Frame body 굴절 — PORTFOLIO를 "가리는 게 아니라 굴절시키는" 목적.
          scale 2.5 — 매우 미세, 글자 외곽선이 살짝 흔들리는 정도.
          글자의 명도/형태는 그대로 보존.
        */}
        <filter id="refraction" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/*
          타이틀 liquid 번짐 — Hero "MINJOO" h1 에 직접 적용.
          마우스 X 위치 → feDisplacementMap scale (18~40) 을 RAF lerp 로 조정.
          idle: feTurbulence baseFrequency 를 SVG <animate> 로 미세 진동 (GSAP 충돌 없음).
          bloom: displaced 를 feGaussianBlur 0.8 로 살짝 번진 뒤 feMerge (아래 = bloom, 위 = sharp).
          filter region 충분히 크게 — 대형 디스플레이 폰트 displacement 클리핑 방지.
        */}
        <filter id="title-liquid" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            id="title-turb"
            type="fractalNoise"
            baseFrequency="0.002 0.009"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.002 0.009;0.003 0.011;0.002 0.009"
              dur="5s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            id="title-disp-map"
            in="SourceGraphic"
            in2="noise"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.8" result="bloom" />
          <feMerge>
            <feMergeNode in="bloom" />
            <feMergeNode in="displaced" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

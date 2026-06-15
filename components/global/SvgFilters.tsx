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
      </defs>
    </svg>
  )
}

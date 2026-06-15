/**
 * 시드 기반 의사난수 — Content & Marketing 종이 회전·offset,
 * Browser Frame 위치 등에 사용. 같은 seed면 같은 값 → 새로고침해도 동일.
 *
 * Mulberry32 알고리즘 (32-bit, 가벼움).
 */

export function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/** index → ±range 사이 결정적 값 */
export function seededRange(seed: number, range: number) {
  const r = mulberry32(seed)()
  return (r * 2 - 1) * range
}

/** index → 0..max 정수 */
export function seededInt(seed: number, max: number) {
  return Math.floor(mulberry32(seed)() * max)
}

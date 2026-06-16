/**
 * SplitText 인스턴스 생성 + revert cleanup 래퍼.
 * useEffect cleanup에서 반환된 revert() 를 호출하면 원본 DOM 복원.
 * React 18 Strict Mode 이중실행 시 revert → 재생성 사이클이 올바르게 동작.
 */
import { SplitText } from 'gsap/SplitText'

type SplitType =
  | 'lines'
  | 'words'
  | 'chars'
  | 'lines,words'
  | 'lines,chars'
  | 'words,chars'
  | 'lines,words,chars'

type SplitOpts = {
  /** 분해 단위 — 기본값: 'lines' */
  type?: SplitType
  /** 생성된 line 요소에 추가할 CSS 클래스 */
  linesClass?: string
  /** 생성된 word 요소에 추가할 CSS 클래스 */
  wordsClass?: string
  /** 생성된 char 요소에 추가할 CSS 클래스 */
  charsClass?: string
  /** 래퍼 태그 — 기본값: 'div' */
  tag?: string
}

export type SplitTextResult = {
  split: SplitText
  lines: Element[]
  words: Element[]
  chars: Element[]
  /** 원본 DOM 복원 — useEffect cleanup에서 호출 */
  revert: () => void
}

export function splitTextSafe(target: Element, opts: SplitOpts = {}): SplitTextResult {
  const { type = 'lines', ...rest } = opts
  const split = new SplitText(target, { type, ...rest })

  return {
    split,
    lines: split.lines,
    words: split.words,
    chars: split.chars,
    revert: () => split.revert()
  }
}

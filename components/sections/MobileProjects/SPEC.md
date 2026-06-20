# Mobile Projects — 옵션 C (Horizontal Spread) 시각 spec

> 매거진 펼친 면 메타포 · sticky 200vh · wheel 1tick = 1page · 다크 단일톤
> 강개발 핸드오프: 픽셀 X, **토큰·비율** 만. 모든 수치는 base 1920 기준 `vw()` 헬퍼 적용.

---

## 0. 글로벌 토큰 (Crowny 의존 X · 본 섹션 직접 정의)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--m-bg` | `#0A0A0A` | 다크 페이지 배경 (전체 sticky wrapper) |
| `--m-ink` | `rgba(248,247,244,1.00)` | 워드마크 · 표지 manifesto |
| `--m-ink-80` | `rgba(248,247,244,0.80)` | 주 CTA (제작과정) |
| `--m-ink-60` | `rgba(248,247,244,0.60)` | tagline · uxIntent 본문 |
| `--m-ink-55` | `rgba(248,247,244,0.55)` | meta value · ExtLink |
| `--m-ink-30` | `rgba(248,247,244,0.30)` | index · 페이지 번호 |
| `--m-ink-25` | `rgba(248,247,244,0.25)` | meta label |
| `--m-hair` | `rgba(248,247,244,0.08)` | 책등 hairline · gutter |
| `--m-hair-strong` | `rgba(248,247,244,0.14)` | 표지 frame · 챕터 구분선 |

**폰트 (기존 변수 재사용)**
- `var(--font-display)` — PP Editorial : *Intro manifesto*, *워드마크* 만
- `var(--font-pretendard)` — 본문 (tagline, uxIntent, role 풀이)
- `var(--font-mono)` — index, 페이지번호, label/value, CTA, stack chip

**최소 폰트 16px 규칙 — 본 섹션 예외**
포트폴리오 전역에서 meta label/index/페이지번호는 mono 10~11px 톤이 *이미 채택됨* (HeroStickyExchange · 기존 MetaRail). 본 spec 그 톤 유지. 단 *읽혀야 하는* 본문(tagline·uxIntent·manifesto) 은 모두 **≥17px**.

---

## 1. sticky wrapper · 페이지 그리드

```
┌─ #mobile sticky wrapper ─ height: 200vh ──────────────────┐
│  position: sticky; top: 0; height: 100vh; overflow:hidden │
│  background: var(--m-bg)                                  │
│                                                           │
│  ┌─ horizontal track ─ width: 300vw; display:flex ─────┐ │
│  │  transform: translateX(-Npage * 100vw) (강개발)      │ │
│  │                                                      │ │
│  │  [Page 0 · Intro Cover ]  [Page 1 · 자린고비]        │ │
│  │  [Page 2 · TripMate    ]                             │ │
│  │   ↑ 각 page width: 100vw, height: 100vh              │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**페이지 전환 hint**: clean cut. 이전·다음 페이지 *살짝 보이기 금지*.
- 이유: 매거진은 한 번에 한 spread. 살짝 보이면 "캐러셀" 어휘로 떨어짐.
- 단 페이지 인디케이터 (3절) 가 *지금 몇 쪽인지* 항상 알려줌.

---

## 2. Intro Cover (Page 0) — 표지

```
┌────────── 100vw × 100vh ────────────────────────────────┐
│ padding: clamp(56px, 6vw, 112px)  ← magazine outer       │
│                                                          │
│  MOBILE PROJECTS                          IV / VII       │  ← top row
│  mono 12px · 0.18em · ink-30              mono · ink-30 │
│  ─────────────────────────────────────────────────────  │  ← hair-strong, 1px, full
│                                                          │
│                                                          │
│              Two apps,                                   │  ← display
│              one designer,                               │     vw(120, 64)
│              one keyboard.                               │     ink, lh 0.96
│              ──                                          │     letter -0.03em
│              (manifesto · placeholder)                   │     [CEO 카피 교체]
│                                                          │
│                                                          │
│  ─────────────────────────────────────────────────────  │  ← hair-strong, 1px, full
│  COVER                                    01 / 03  →    │  ← bottom row
│  mono 11px · ink-25                       mono · ink-55 │
└──────────────────────────────────────────────────────────┘
```

**결정값**
- outer padding `clamp(56px, 6vw, 112px)` 4면
- 상·하 hair-strong (`--m-hair-strong`) 1px full width, *frame 효과*
- manifesto 좌측 정렬 · 페이지 *중앙 세로* 배치 (`justify-content: center`)
- 우측 하단 `01 / 03 →` 의 `→` arrow: hover 시 `translateX(4px)` 200ms ease — *다음 페이지 hint*
- 우측 상단 `IV / VII` = 사이트 7섹션 중 4번째 (Mobile Projects 위치). hard-coded.

---

## 3. App Page (Page 1·2) — 펼친 면 메타포

```
┌────────── 100vw × 100vh ─ Page 1 (자린고비) ─────────────┐
│ ←─ 좌 페이지 50vw ─→│←─ 우 페이지 50vw ─→                │
│                     │                                    │
│  ┌── gutter pad ──┐ │ ┌── gutter pad ──┐                 │
│  │                │ │ │                │                 │
│  │                │ │ │  01    Released│ ← meta rail     │
│  │   [PHONE]      │ │ │        May 2026│   (재사용)      │
│  │   9:19.5       │ │ │        Category│                 │
│  │   maxH 78vh    │ │ │        게임앱   │                 │
│  │   centered     │ │ │        Platform│                 │
│  │                │ │ │        ANDROID │                 │
│  │  (hover → video│ │ │                │                 │
│  │   fade-in)     │ │ │  자린고비       │ ← wordmark      │
│  │                │ │ │  display 96/64 │                 │
│  │                │ │ │                │                 │
│  │                │ │ │  아끼면 이긴다, │ ← tagline       │
│  │                │ │ │  절약을 게임으로│   17~24px       │
│  │                │ │ │                │                 │
│  │                │ │ │  여행 동행 매칭 │ ← uxIntent      │
│  │                │ │ │  의 첫 마찰…    │   (신규)        │
│  │                │ │ │                │                 │
│  │                │ │ │  ── 제작과정 → │ ← CTA           │
│  │                │ │ │  Google Play ↗ │                 │
│  └────────────────┘ │ └────────────────┘                 │
│                     │                                    │
│  PAGE                ║                       02 / 03  →  │
│  mono · ink-25      ║                       mono · ink-55│
└─────────────────────╨──────────────────────────────────-─┘
                       ↑ 책등 hairline (4절 참고)
```

**좌·우 비율**
- 좌 페이지: `50vw` — **폰 mock 전용**. 다른 컨텐츠 X. (silence is the layout)
- 우 페이지: `50vw` — meta rail + 본문 + CTA
- mirror 없음. *Page 1 과 Page 2 모두 동일 배치 (폰 좌·정보 우)*. 매거진은 챕터마다 spread 통일.

**페이지별 padding (gutter)**
- 좌 페이지: `padding-left: clamp(56px, 6vw, 112px)`, `padding-right: clamp(32px, 3vw, 56px)` (책등 쪽 narrow)
- 우 페이지: `padding-left: clamp(32px, 3vw, 56px)` (책등 쪽 narrow), `padding-right: clamp(56px, 6vw, 112px)`
- 상하: `padding-block: clamp(80px, 8vh, 120px)`

**우 페이지 내부 — meta rail + body 2열**
- meta rail: `vw(130, 105)` (기존 동일)
- body: `flex: 1`, max `vw(460, 320)`
- 두 열 사이 gap: `clamp(32px, 2.5vw, 56px)`
- 세로 정렬: `align-items: center` (vertical center)

---

## 4. 책등 (spine) hairline

| 항목 | 값 |
|---|---|
| 위치 | `left: 50%; transform: translateX(-50%)` |
| 폭 | `1px` |
| 길이 | `60vh` (상·하 20vh 여백 — frame 안에서만 떠 있음) |
| 색 | `var(--m-hair)` = `rgba(248,247,244,0.08)` |
| 적용 페이지 | **Page 1, Page 2 만**. Intro Cover 에는 없음 (표지엔 책등 안 보임). |

---

## 5. 페이지 인디케이터 · top/bottom row

**Top row (모든 page · 표지 포함)**
- 좌측: 페이지 라벨 — `COVER` / `PAGE` (mono 11px · 0.18em · ink-25)
- 우측: 챕터 번호 — `IV / VII` (mono 11px · 0.18em · ink-30)
- 그 아래 `--m-hair-strong` 1px full-width 선

**Bottom row (모든 page)**
- 좌측: 라벨 반복 — `COVER` / `자린고비` / `TripMate` (mono 11px · ink-25 · UPPERCASE · 0.18em)
- 우측: `01 / 03` · `02 / 03` · `03 / 03` (mono 13px · 0.14em · ink-55)
- 우측 끝 `→` arrow 는 *마지막 페이지 제외*. 마지막 페이지(03/03)는 `↓` (다음 섹션 hint).
- 그 위 `--m-hair-strong` 1px full-width 선

---

## 6. 4신규 필드 — DOM 위치 매핑

| 필드 | 위치 | 폰트 | 크기 (vw 헬퍼) | 색 | 비고 |
|---|---|---|---|---|---|
| `period` | meta rail · Released 아래 | mono | label 10/9 + value 11/10 | label `ink-25` · value `ink-55` | label `DURATION` |
| `role` | meta rail · Platform 아래 | mono | label 10/9 + value 11/10 | label `ink-25` · value `ink-55` | label `ROLE`, 줄바꿈 허용 (`white-space: pre-line`) |
| `stack` | meta rail 맨 아래 (기존 위치 유지) | mono chip | 11/10 · 0.08em UPPERCASE | `ink-60` on `rgba(255,255,255,0.06)` | 변경 없음 (현행 유지) |
| `uxIntent` | body · tagline **아래** · CTA **위** | Pretendard | `vw(18, 16)` · lh 1.6 | `ink-60` | 앞에 `vw(20, 16)` 길이 1px hairline (`--m-hair-strong`) 한 줄, 그 아래 본문 — *editorial 인용구* 어휘 |

**기존 필드 위치 (변경 없음 — 재배치만)**
| 필드 | 위치 |
|---|---|
| `index` | meta rail 최상단 (mono · ink-30) |
| `releaseDate` | meta rail · `RELEASED` 라벨 |
| `category` | meta rail · `CATEGORY` 라벨 |
| `platforms` | meta rail · `PLATFORM` 라벨 (세로 stack) |
| `title` | body · 워드마크 (display vw(96,64)) |
| `tagline` | body · 워드마크 아래 `vw(24,17)` · ink-60 |
| `studyHref` | body · CTA 묶음 최상단 — 주 CTA |
| `downloadLinks` | body · CTA 묶음 하단 — 부 CTA (ExtLink 재사용) |
| `thumbnail` / `previewVideo` | 좌 페이지 PhoneMockup (`maxHeight="78vh"`) |
| `comingSoon` | body 워드마크 우측 상단 mono badge — `ink-30` (`COMING SOON`) |

---

## 7. PhoneMockup 크기·위치

- 좌 페이지 *중앙* (수평·수직 모두). `display:flex; align-items:center; justify-content:center`
- `maxHeight: 78vh` — 상하 frame (top/bottom row) 침범 금지
- 9:19.5 비율 유지 (기존 PhoneMockup 컴포넌트 그대로 사용)
- 호버 시 `previewVideo` fade-in — 현행 패턴 유지 (변경 없음)
- `dimmed={false}` — Page 1·2 모두 active

---

## 8. 페이지 전환 동작 (강개발 핸드오프)

- **wheel cooldown**: 600ms · `HeroStickyExchange` 동일 패턴 재사용
- **transform 함수**: `cubic-bezier(0.7, 0, 0.3, 1)` · 800ms — *editorial flip 어휘*
- **GSAP scrub 금지** — wheel-tick 기반 discrete 전환. 매거진은 *페이지를 넘기는* 것이지 *스크롤되는* 것이 아님.
- **터치/스와이프**: 좌·우 swipe = 1 페이지. swipe threshold `40px`.
- **키보드**: `←` `→` 화살표 = 페이지 이동 (a11y).
- 마지막 페이지(03/03)에서 추가 wheel-down → sticky 해제 · 다음 섹션 release.

---

## 9. CEO 결정 필요 항목

1. **Intro Cover manifesto 카피** (현재 placeholder: *"Two apps, one designer, one keyboard."*)
2. **`period`** — 자린고비 / TripMate 각각 (예: `"4 weeks"` / `"6 weeks"`)
3. **`role`** — 자린고비 / TripMate 각각 (예: `"Solo Design + Dev"` / `"Design Lead"`)
4. **`stack`** — TripMate (현재 빈 배열). 자린고비도 미정 → 둘 다 채울 것
5. **`uxIntent`** — 자린고비 / TripMate 각각 한 줄. 카피 톤: *"…의 첫 마찰을 줄이기"* / *"…를 게임으로 번역하기"* 류
6. **챕터 번호 `IV / VII`** — Mobile Projects 가 사이트 7섹션 중 *진짜* 4번째 맞는지 강팀장 확인

---

## 10. ✓ 체크리스트

- [x] 흐름 먼저: sticky → wheel-tick → 3페이지 spread → release. 분기 0, 단계 3
- [x] 시각 위계: 워드마크(display) → tagline → uxIntent → meta · CTA
- [x] 모든 본문 ≥17px / 라벨·번호는 기존 mono 톤 유지
- [x] 토큰만 사용 — 임의 HEX 0개 (`#0A0A0A` 1개는 활성 base 선언)
- [x] 상태: hover (CTA color · arrow translate · video fade-in) · disabled 없음 (외부 링크) · loading (영상 lazy)
- [x] 폰트 3종 (Pretendard / PP Editorial / Mono) — 추가 도입 0
- [x] PC·모바일 토큰 동일 — 본 spec 은 PC 1920 base. 모바일 분기는 별도 spec (이번 PR 범위 아님)
- [x] mirror 폐기 — 매거진 어휘 일관성 우선

— 강디

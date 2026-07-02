import { projects } from '@/data/projects'
import { mobileProjects } from '@/data/mobile-projects'
import { contentGroups } from '@/data/content'
import { footer } from '@/data/footer'
import { visualWorks } from '@/data/visualWorks'
import { about } from '@/data/about'

/**
 * /pdf-fan — 팬마케팅 전용 PDF 슬라이드 덱 (16:9).
 *
 * 주력: 팬 마케팅 · 아티스트 프로모션(KiiiKiii, 제작과정 노출) + 콘텐츠 마케팅.
 *   Cover → 포지셔닝 → KiiiKiii(주력) → Content&Marketing
 *        → 기타 작업(웹+앱 썸네일) → Visual Works → Contact
 *
 * /pdf(전체 덱)와 별개 문서. 생성: npm run pdf:fan
 * 결과물: public/portfolio/park-minjoo-portfolio-fan.pdf
 */

/* ══════════ 공통 프리미티브 (/pdf 와 동일 톤) ══════════ */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-r32m.vercel.app'
const abs = (href?: string) =>
  !href ? undefined : href.startsWith('http') ? href : `${SITE}${href}${href.endsWith('/') ? '' : '/'}`
const img = (src?: string, w = 1280, q = 72) =>
  src ? `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}` : undefined
const MONTH: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}
const krDate = (d: string) => {
  const [mon, year] = d.split(' ')
  return MONTH[mon] ? `${year}.${MONTH[mon]}` : d
}

const DARK = '#0A0A0A'
const L = 'rgba(248,247,244,'
const D = 'rgba(17,17,17,'
const PAGE = '#F1F0EC'
const LINK_TONE: Record<'site' | 'case', { light: string; dark: string }> = {
  site: { light: '#B0595A', dark: '#E39B9B' },
  case: { light: '#2C6E6E', dark: '#83C0C0' },
}
type Tone = 'site' | 'case'
const toneOf = (label: string): Tone | undefined =>
  label === '실사이트' || label === '스토어' || label === '보러가기'
    ? 'site'
    : label === '깃허브' || label === '카페24'
      ? undefined
      : 'case'

const W = 1280
const H = 720

const pdfStyle = `
  nav, .fixed { display: none !important; }
  html, body { background: ${DARK} !important; }
  @page { size: ${W}px ${H}px; margin: 0; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
  .slide { break-after: page; overflow: hidden; }
  .slide:last-child { break-after: auto; }
  a { color: inherit; text-decoration: none; }
`

function Slide({ bg = DARK, pad = '64px 88px', watermark, children, style }: { bg?: string; pad?: string; watermark?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="slide" style={{ width: `${W}px`, height: `${H}px`, background: bg, padding: pad, position: 'relative', isolation: 'isolate', display: 'flex', flexDirection: 'column', ...style }}>
      {/* 초대형 고스트 워터마크 (섹션 오프너) */}
      {watermark && <span aria-hidden style={{ position: 'absolute', zIndex: -1, right: '-14px', bottom: '-58px', fontFamily: 'var(--font-display)', fontSize: '300px', lineHeight: 0.8, letterSpacing: '-0.03em', color: D + '0.07)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{watermark}</span>}
      {children}
    </section>
  )
}

function Foot({ n, label, dark = true }: { n: string; label: string; dark?: boolean }) {
  const c = dark ? L : D
  const cur = parseInt(n, 10) || 1
  const total = 13
  const accent = LINK_TONE.site[dark ? 'dark' : 'light']
  return (
    <div style={{ position: 'absolute', left: '88px', right: '88px', bottom: '34px' }}>
      {/* 문서 전체 progress spine — 현재 위치 accent, 챕터 경계(04·09) 마디 */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '11px' }}>
        {Array.from({ length: total }).map((_, i) => {
          const idx = i + 1
          const isChapter = idx === 4 || idx === 9
          const isCur = idx === cur
          return (
            <span key={i} style={{ height: isChapter ? '7px' : '3px', width: isCur ? '22px' : '8px', borderRadius: '2px', background: isCur ? accent : idx < cur ? c + '0.42)' : c + '0.14)', transition: 'none' }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', color: c + '0.4)' }}>
        <span>{label}</span>
        <span>{n}</span>
      </div>
    </div>
  )
}

function LinkChip({ href, children, light = false, tone }: { href: string; children: React.ReactNode; light?: boolean; tone?: Tone }) {
  const toneColor = tone ? LINK_TONE[tone][light ? 'light' : 'dark'] : null
  const color = toneColor ?? (light ? D + '0.9)' : L + '0.95)')
  const border = toneColor ?? (light ? D + '0.4)' : L + '0.4)')
  return (
    <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: tone ? 600 : 400, color, borderBottom: `1px solid ${border}`, paddingBottom: '2px' }}>
      <span>{children}</span>
      <span style={{ fontSize: '13px', opacity: tone ? 1 : 0.7 }}>↗</span>
    </a>
  )
}

/* 작은 인라인 링크 (기타 작업 카드용) */
function Mini({ href, tone, children }: { href: string; tone: Tone; children: React.ReactNode }) {
  const c = LINK_TONE[tone].light
  return (
    <a href={href} style={{ fontSize: '11.5px', fontWeight: 600, color: c, borderBottom: `1px solid ${c}`, paddingBottom: '1px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {children}<span style={{ fontSize: '9px' }}>↗</span>
    </a>
  )
}

function Stack({ items, dark = true }: { items: string[]; dark?: boolean }) {
  const clean = items.filter((s) => s !== '—')
  if (!clean.length) return null
  const c = dark ? L : D
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {clean.map((s) => (
        <span key={s} style={{ fontSize: '13px', letterSpacing: '0.05em', color: c + '0.7)', background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(17,17,17,0.05)', padding: '4px 11px', borderRadius: '4px' }}>{s}</span>
      ))}
    </div>
  )
}

function SectionLabel({ en, kr, dark = true }: { en: string; kr: string; dark?: boolean }) {
  const c = dark ? L : D
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.2em', color: c + '0.55)' }}>{en}</span>
      <span style={{ fontSize: '14px', color: c + '0.45)' }}>{kr}</span>
      <span style={{ flex: 1, height: '1px', background: c + '0.14)' }} />
    </div>
  )
}

/* Content & Marketing 표시용 (/pdf 와 동일) */
const CM_METRIC: Record<string, { big: string; sub: string }> = {
  'app-launch': { big: '출시', sub: 'Google Play · 2026' },
  'promotion': { big: '4편', sub: '15초 티저 시리즈 · IG / TikTok' },
  'personal': { big: '80K', sub: '3개월 도달 · 주 3–4회 발행' },
}
const CM_TITLE: Record<string, string> = { personal: 'STUDY LOG · 콘텐츠 크리에이터' }
const CM_DESC: Record<string, string> = {
  'app-launch': '팀 프로젝트에서 디자인·마케팅 담당 — 앱 아이콘·스토어·카피 제작.',
  'promotion': '빌드인퍼블릭 전략의 15초 티저 시리즈. 기획·촬영·편집 1인 진행.',
  'personal': 'UI/UX 작업 일상을 담은 콘텐츠 채널. 꾸준한 발행이 브랜드 협업으로.',
}
const IB_NAME: Record<string, string> = { medicube: '메디큐브 · 올리브영', 'ponder-ai': 'Ponder AI' }

/* ═══════════════════════════ 페이지 ═══════════════════════════ */
export default function PdfFanPage() {
  const kiii = projects.find((p) => p.id === 'project08')! // KiiiKiii
  const otherWeb = projects.filter((p) => p.type === 'web' && p.id !== 'project08')
  const posters = visualWorks.filter((v) => v.category === 'poster')
  const banners = visualWorks.filter((v) => v.category === 'banner')
  const { statement, body, basicInfo, profile, skills, education, certificates } = about

  return (
    <div style={{ background: DARK }}>
      <style dangerouslySetInnerHTML={{ __html: pdfStyle }} />

      {/* ═══ 1. COVER — 풀블리드 키비주얼 + 성과 훅 ═══ */}
      <Slide bg={DARK} pad="0">
        {/* KiiiKiii 키비주얼 배경 — 확대해 하단 baked 텍스트 크롭 */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/portfolio-src/pdf-fan-cover.jpg)', backgroundSize: '126%', backgroundPosition: 'center 4%', backgroundRepeat: 'no-repeat' }} />
        {/* 스크림 — 좌하단 텍스트존 가독성 (단일 그라데이션) */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(15deg, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.32) 42%, rgba(10,10,10,0) 74%)' }} />
        {/* 콘텐츠 — 좌하단 앵커(비대칭) */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '88px 88px 92px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.28em', color: L + '0.6)' }}>PORTFOLIO · FAN MARKETING</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '100px', fontWeight: 400, lineHeight: 0.9, letterSpacing: '-0.02em', color: L + '1)', marginTop: '16px' }}>
            <span style={{ display: 'block' }}>Fan Marketing</span>
          </h1>
          {/* 훅 한 줄 — 팬마케팅 관점·방향 */}
          <p style={{ fontSize: '22px', lineHeight: 1.45, color: L + '0.92)', marginTop: '22px', wordBreak: 'keep-all', maxWidth: '760px' }}>
            팬은 받은 콘텐츠를 소비하지 않고 ‘다룹니다’. <span style={{ color: LINK_TONE.site.dark, fontWeight: 600 }}>그 손끝의 순간을 캠페인으로 설계</span>합니다.
          </p>
          {/* 이름 전용 라인 (누가 만들었나) */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 500, color: L + '0.98)', marginTop: '26px' }}>
            박민주 <span style={{ fontSize: '20px', color: L + '0.65)', letterSpacing: '0.04em' }}>PARK MINJOO</span>
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.14em', color: L + '0.6)', marginTop: '8px' }}>콘텐츠 마케터 · 팬 프로모션 기획</p>
        </div>
        <Foot n="01 / 13" label="INTRO" />
      </Slide>

      {/* ═══ 2. ABOUT — 훅 풀쿼트 + 서포트 ═══ */}
      <Slide style={{ justifyContent: 'center' }}>
        {/* 풀쿼트 (이 덱 전용 훅) */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em', color: L + '1)', wordBreak: 'keep-all' }}>
          <span style={{ display: 'block' }}>팬이 콘텐츠를 <span style={{ color: LINK_TONE.site.dark }}>‘다루는’ 순간</span>에,</span>
          <span style={{ display: 'block' }}>브랜드가 팬에게 닿습니다.</span>
        </h2>
        {/* 서포트 — 영문 스테이트먼트 + 본문, 대비 낮춤 */}
        <p style={{ fontSize: '15px', lineHeight: 1.75, color: L + '0.5)', marginTop: '32px' }}>
          {statement.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </p>
        <p style={{ fontSize: '14px', lineHeight: 1.7, color: L + '0.45)', marginTop: '14px', wordBreak: 'keep-all' }}>
          {body.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </p>
        <div style={{ marginTop: '38px', borderTop: `1px solid ${L}0.16)`, paddingTop: '18px', maxWidth: '660px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: L + '0.5)', marginBottom: '10px' }}>LIVE PORTFOLIO</p>
          <p style={{ fontSize: '14px', lineHeight: 1.65, color: L + '0.55)', wordBreak: 'keep-all', marginBottom: '14px' }}>
            이 포트폴리오는 스크롤 인터랙션·모션이 있는 웹입니다. PDF엔 정지 화면만 담겨, 실제 움직임·구현은 라이브에서 확인하실 수 있습니다.
          </p>
          <LinkChip href={SITE} tone="site">라이브 포트폴리오 열기</LinkChip>
        </div>
        <Foot n="02 / 13" label="ABOUT" />
      </Slide>

      {/* ═══ 3. ABOUT INDEX ═══ */}
      <Slide bg={PAGE} watermark="ABOUT">
        <SectionLabel en="ABOUT — INDEX" kr="소개 · 인덱스" dark={false} />
        <div style={{ display: 'flex', gap: '64px', flex: 1, alignItems: 'stretch' }}>
          <div style={{ width: '39%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '184px', aspectRatio: '4 / 5', backgroundImage: img('/images/about/profile.jpg', 384) ? `url(${img('/images/about/profile.jpg', 384)})` : undefined, backgroundColor: '#e4e2dd', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '37px', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', color: D + '0.95)', wordBreak: 'keep-all', marginTop: '22px' }}>
              {profile.taglineLines.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
            </h2>
            <div style={{ marginTop: '18px', fontSize: '14.5px', lineHeight: 1.7, color: D + '0.62)' }}>
              {profile.intro.map((t, i) => (
                <p key={i} style={{ marginBottom: '12px', wordBreak: 'keep-all' }}>{t.replace(/\n/g, ' ')}</p>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '26px', paddingTop: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
              <IndexBlock title="BASIC">
                <IdxRow>{basicInfo.name}</IdxRow>
                <IdxRow dim>{basicInfo.birth}</IdxRow>
                <IdxRow>{basicInfo.phone}</IdxRow>
                <IdxRow>{basicInfo.email}</IdxRow>
              </IndexBlock>
              <IndexBlock title="EDUCATION">
                {education.map((e) => <IdxRow key={e.name}>{e.name} <span style={{ color: D + '0.45)' }}>· {e.status}</span></IdxRow>)}
              </IndexBlock>
            </div>
            <IndexBlock title="SKILLS">
              {Object.entries(skills).map(([g, items]) => (
                <div key={g} style={{ display: 'flex', gap: '14px', marginBottom: '10px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', color: D + '0.5)', width: '68px', flexShrink: 0 }}>{g}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(items as readonly string[]).map((s) => (
                      <span key={s} style={{ fontSize: '13px', color: D + '0.85)', background: 'rgba(17,17,17,0.05)', padding: '3px 9px', borderRadius: '4px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </IndexBlock>
            <IndexBlock title="CERTIFICATE">
              <div style={{ columns: 2, columnGap: '32px' }}>
                {certificates.map((c) => (
                  <div key={c.name} style={{ fontSize: '13.5px', lineHeight: 1.75, color: D + '0.8)', breakInside: 'avoid' }}>
                    {c.name}{c.date ? <span style={{ color: D + '0.45)' }}> · {c.date}</span> : null}
                  </div>
                ))}
              </div>
            </IndexBlock>
          </div>
        </div>
        <Foot n="03 / 13" label="ABOUT" dark={false} />
      </Slide>

      {/* ═══ CHAPTER 01 구분 — 팬 마케팅 · KiiiKiii (딥틸 틴트 + 초대형 넘버) ═══ */}
      <Slide bg={PAGE} style={{ justifyContent: 'center' }}>
        {/* 배경 구조물 — 초대형 아웃라인 01 (좌상단 블리드, 대각축) */}
        <span aria-hidden style={{ position: 'absolute', zIndex: -1, left: '20px', top: '-46px', fontFamily: 'var(--font-display)', fontSize: '400px', fontWeight: 400, lineHeight: 0.72, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: `1.4px ${D}0.10)`, pointerEvents: 'none' }}>01</span>
        <div style={{ paddingLeft: '4px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.2em', color: LINK_TONE.case.light, marginBottom: '12px' }}>FAN MARKETING · ARTIST PROMOTION</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.02em', color: D + '0.92)', wordBreak: 'keep-all' }}>
            아티스트 프로모션 <span style={{ color: D + '0.35)' }}>·</span> KiiiKiii
          </h2>
        </div>
        <div style={{ height: '1px', width: '100%', background: D + '0.14)', marginTop: '28px' }} />
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: D + '0.7)', marginTop: '18px', wordBreak: 'keep-all', maxWidth: '820px' }}>
          왜 하필 신인 KiiiKiii인가 — <span style={{ color: LINK_TONE.site.light, fontWeight: 600 }}>팬마케터의 지렛대는 팬덤 형성기에 가장 길다.</span> 스타쉽의 신인을 팬 관점으로 기획한 인터랙티브 프로모션을, 대표작 · 전략 · 가상 컴백 캠페인으로 증명합니다.
        </p>
        <Foot n="04 / 13" label="CHAPTER 01" dark={false} />
      </Slide>

      {/* ═══ KiiiKiii — 대표작 (좌 3티어 / 우 54컷 벽) ═══ */}
      <Slide bg={PAGE} pad="0" style={{ flexDirection: 'row' }}>
        <div style={{ width: '40%', padding: '64px 44px 80px 88px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '30px' }}>
          {/* 티어 1 · 정체 */}
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: D + '0.45)' }}>대표작 · 팬 마케팅</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '58px', fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.02em', color: D + '1)', marginTop: '10px' }}>{kiii.wordmark ?? kiii.title}</h2>
            <p style={{ fontSize: '13px', letterSpacing: '0.04em', color: D + '0.45)', marginTop: '12px', wordBreak: 'keep-all' }}>{krDate(kiii.date)} · {kiii.category}</p>
          </div>
          {/* 티어 2 · 의미 */}
          <div>
            {kiii.tagline && <p style={{ fontSize: '16px', lineHeight: 1.5, color: D + '0.8)', wordBreak: 'keep-all' }}>{kiii.tagline}</p>}
            {kiii.role && <p style={{ fontSize: '13px', color: D + '0.5)', marginTop: '10px', wordBreak: 'keep-all' }}>{kiii.role.filter((r) => r !== '—').join(' · ')}</p>}
            <div style={{ marginTop: '12px' }}><Stack items={kiii.stack ?? []} dark={false} /></div>
          </div>
          {/* 티어 3 · 행동 */}
          <div>
            <p style={{ fontSize: '13px', color: D + '0.6)', wordBreak: 'keep-all' }}>기획 의도와 제작과정 전체를 라이브에서 공개합니다.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '12px' }}>
              {kiii.studyHref && <LinkChip href={abs(kiii.studyHref)!} light tone="case">{kiii.studyLabel ?? '제작과정'}</LinkChip>}
              {kiii.siteHref && <LinkChip href={kiii.siteHref} light tone="site">실사이트</LinkChip>}
            </div>
            <p style={{ fontSize: '11px', color: D + '0.4)', marginTop: '16px', lineHeight: 1.55, wordBreak: 'keep-all' }}>
              비공식 팬메이드 · 컨셉 이미지는 시연 목적. 공식 진행 시 라이선스·아티스트 보호 기준으로 설계합니다.
            </p>
          </div>
        </div>
        <div style={{ width: '60%', height: '100%', backgroundColor: '#e9e7e1', backgroundImage: 'url(/portfolio-src/pdf-fan-gallery.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <Foot n="05 / 13" label="SELECTED WORK — FAN MARKETING" dark={false} />
      </Slide>

      {/* ═══ 5. STRATEGY ① — 관찰 + 시장 빈칸 ═══ */}
      <Slide bg={PAGE}>
        <SectionLabel en="STRATEGY — INSIGHT" kr="왜 만들었나 · 관찰과 시장" dark={false} />
        <div style={{ flex: 1, display: 'flex', gap: '56px' }}>
          {/* 좌: 인사이트 + 포지셔닝 */}
          <div style={{ width: '52%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', color: D + '0.45)', marginBottom: '14px' }}>INSIGHT</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 400, lineHeight: 1.22, letterSpacing: '-0.01em', color: D + '0.95)', wordBreak: 'keep-all' }}>
              코어팬은 앨범 사진을 소비하지 않는다 — <span style={{ color: LINK_TONE.case.light }}>다룬다.</span>
            </h2>
            <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: D + '0.62)', marginTop: '18px', wordBreak: 'keep-all' }}>
              모음 · 고름 · 깔기 · 섞기 — 받은 비주얼을 자기 공간에 다시 배치하는 반복 루프. 1회성 소비가 아니라 재배치라서 체류와 애착이 길어진다.
            </p>
            <div style={{ height: '1px', background: D + '0.14)', margin: '28px 0 20px' }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', color: D + '0.45)', marginBottom: '10px' }}>POSITIONING</p>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: D + '0.6)', wordBreak: 'keep-all' }}>
              공식(정보) · SNS(소비) · Weverse(대화) 사이의 빈칸 —
            </p>
            <p style={{ fontSize: '19px', lineHeight: 1.5, color: D + '0.92)', marginTop: '8px', wordBreak: 'keep-all' }}>
              컨셉을 5분간 손으로 만지는 <span style={{ color: LINK_TONE.site.light, fontWeight: 600 }}>‘내재화’의 자리</span>.
            </p>
          </div>
          {/* 우: 2×2 시장 맵 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', color: D + '0.45)', marginBottom: '14px' }}>MARKET MAP · 2025–26 K-POP</p>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1.25 / 1', border: `1px solid ${D}0.16)` }}>
              {/* 축선 */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: D + '0.1)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: D + '0.1)' }} />
              {/* 축 라벨 */}
              <span style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: D + '0.4)' }}>그룹 · 통합</span>
              <span style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: D + '0.4)' }}>솔로 · 분산</span>
              <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: D + '0.4)' }}>정적</span>
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: D + '0.4)' }}>인터랙티브</span>
              {/* 벤치마크 */}
              <span style={{ position: 'absolute', left: '24%', top: '68%', fontSize: '12px', color: D + '0.55)' }}>윤아 · 핀터레스트</span>
              <span style={{ position: 'absolute', left: '30%', top: '44%', fontSize: '12px', color: D + '0.55)' }}>데이식스 · 노션</span>
              <span style={{ position: 'absolute', left: '56%', top: '62%', fontSize: '12px', color: D + '0.55)' }}>르세라핌 · 게임화</span>
              {/* KiiiKiii 빈자리 */}
              <span style={{ position: 'absolute', left: '62%', top: '20%', fontSize: '13px', fontWeight: 700, color: LINK_TONE.site.light, wordBreak: 'keep-all' }}>KiiiKiii microsite<br /><span style={{ fontSize: '10px', fontWeight: 400 }}>← 그룹 · 인터랙티브 빈자리</span></span>
            </div>
          </div>
        </div>
        <Foot n="06 / 13" label="STRATEGY — INSIGHT" dark={false} />
      </Slide>

      {/* ═══ STRATEGY ② — 팬 손동작 = 실제 화면 (다크 대비, 이미지 강조) ═══ */}
      <Slide bg={DARK}>
        <SectionLabel en="STRATEGY — TRANSLATION" kr="팬의 손동작을 화면 인터랙션으로 — 실제 화면" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {[
              { src: '/projects/kiikii/study/making/gallery.jpg', act: '모음', intr: '54컷 갤러리로 응집', psy: '‘다 모았다’ 컴플리트' },
              { src: '/projects/kiikii/study/making/cube.jpg', act: '고름', intr: '큐브의 한 컷 클릭', psy: '선택의 무게' },
              { src: '/projects/kiikii/study/making/viewer.jpg', act: '깔기', intr: '윈도우 뷰어로 배치', psy: '소유 · 큐레이션' },
              { src: '/projects/kiikii/study/making/home.jpg', act: '섞기', intr: '닫으면 53장 산개', psy: '재배치 · 두 번째 호기심' },
            ].map((s, i, arr) => (
              <div key={i} style={{ flex: 1 + i * 0.09, display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ width: '100%', aspectRatio: '16 / 11', backgroundColor: '#1a1a1a', backgroundImage: img(s.src, 640) ? `url(${img(s.src, 640)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: i === arr.length - 1 ? `0 0 0 1px ${LINK_TONE.site.dark}55` : 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: L + '0.95)' }}>{s.act}</span>
                    <span style={{ fontSize: '13px', color: L + '0.6)', wordBreak: 'keep-all' }}>{s.intr}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: LINK_TONE.case.dark, marginTop: '5px', wordBreak: 'keep-all' }}>{s.psy}</div>
                </div>
                <div style={{ width: '30px', flexShrink: 0, textAlign: 'center', paddingTop: '72px', fontSize: '18px', color: i < arr.length - 1 ? L + '0.35)' : LINK_TONE.site.dark }}>{i < arr.length - 1 ? '→' : '↻'}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: L + '0.55)', marginTop: '18px', wordBreak: 'keep-all' }}>
            <span style={{ color: LINK_TONE.site.dark }}>↻</span> 그리고 다시 모음으로 — 정해진 동선 없이 반복되는 재배치 루프가 체류·애착을 만든다.
          </p>
          {/* 핵심 결정 + KPI */}
          <div style={{ marginTop: '30px', borderTop: `1px solid ${L}0.16)`, paddingTop: '18px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: L + '0.75)', wordBreak: 'keep-all' }}>
                <span style={{ fontWeight: 700, color: L + '0.95)' }}>핵심 결정 · 정면 없는 큐브</span> — 통제권 이양(수동 시청 → 능동 참여). <span style={{ color: L + '0.5)' }}>폐기안: 무한 grid — 좌표가 생겨 ‘404’와 충돌.</span>
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: L + '0.6)', marginTop: '8px', wordBreak: 'keep-all' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: L + '0.45)' }}>KPI </span>평균 체류 90초↑ · 재방문 · 공유율 → 컴백 초동·스밍 전환 가설.
              </p>
            </div>
            <div style={{ flexShrink: 0, paddingTop: '2px' }}>
              {kiii.studyHref && <LinkChip href={abs(kiii.studyHref)!} tone="case">결정 6개 · 폐기안 전문</LinkChip>}
            </div>
          </div>
        </div>
        <Foot n="07 / 13" label="STRATEGY — TRANSLATION" />
      </Slide>

      {/* ═══ 7. 가상 컴백 캠페인 (KiiiKiii 블록 마무리) ═══ */}
      <Slide bg={PAGE}>
        <SectionLabel en="IF I RAN A COMEBACK" kr="가상 캠페인 · KiiiKiii 차기 컴백" dark={false} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '27px', fontWeight: 400, lineHeight: 1.25, color: D + '0.95)', wordBreak: 'keep-all' }}>
            팬이 컴백을 받는 게 아니라, 매일 한 조각씩 <span style={{ color: LINK_TONE.site.light }}>함께 짓는다.</span>
          </h2>
          <p style={{ fontSize: '13px', color: D + '0.55)', marginTop: '12px', wordBreak: 'keep-all', maxWidth: '900px' }}>
            대표작의 손동작(모음 · 고름 · 깔기 · 섞기)을 7일 컴백 아크로 확장 — 팬이 매일 한 조각씩 참여해 컴백을 ‘완성’하는 구조.
          </p>
          <div style={{ position: 'relative', marginTop: '44px' }}>
            {/* 진행 spine (시간의 방향) */}
            <div style={{ position: 'absolute', top: '6px', left: '5px', right: '5px', height: '2px', background: D + '0.14)' }} />
            <div style={{ display: 'flex' }}>
              {[
                ['D-7', '티저 조각 ‘모으기’ 해금', '자기효능감 · FOMO', '저장 · 재방문'],
                ['D-5', '‘내 델루팩’ 만들기 → 공유카드', '자기표현 · 상호성', 'UGC · 확산'],
                ['D-3', '스밍 리스트 ‘깔기’ + 예약구매', '실행의도 · 앵커링', '저장 · 예약전환'],
                ['D-1', '팬이 쌓은 ‘완성된 컴백 벽’ 공개', '소속감 · 자부심', '인증 · 공유'],
                ['D-DAY', '발매 + 원클릭 총공 가이드', '집단효능감 · FOMO', '총공 · 구매'],
                ['D+1', '‘함께 지은 컴백’ 리캡 카드', '상호성 · 리텐션', '재방문'],
              ].map((c, i) => {
                const isDay = c[0] === 'D-DAY'
                return (
                  <div key={i} style={{ flex: 1, paddingRight: '18px', position: 'relative' }}>
                    {/* spine 위 노드 (D-DAY 정점) */}
                    <div style={{ width: isDay ? '14px' : '10px', height: isDay ? '14px' : '10px', borderRadius: '50%', background: isDay ? LINK_TONE.site.light : PAGE, border: isDay ? 'none' : `2px solid ${D}0.3)`, marginTop: isDay ? '-1px' : '1px', marginBottom: '18px', position: 'relative' }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '0.06em', fontWeight: isDay ? 700 : 600, color: isDay ? LINK_TONE.site.light : D + '0.85)' }}>{c[0]}</div>
                    <div style={{ fontSize: '13px', lineHeight: 1.4, color: D + '0.82)', marginTop: '10px', wordBreak: 'keep-all', minHeight: '56px' }}>{c[1]}</div>
                    <div style={{ fontSize: '12px', lineHeight: 1.45, marginTop: '8px', wordBreak: 'keep-all' }}>
                      <span style={{ color: LINK_TONE.case.light }}>{c[2]}</span> <span style={{ color: D + '0.45)' }}>· {c[3]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ marginTop: '34px', display: 'flex', alignItems: 'baseline', gap: '12px', borderTop: `1px solid ${D}0.1)`, paddingTop: '16px', wordBreak: 'keep-all' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', letterSpacing: '0.12em', color: D + '0.45)', flexShrink: 0 }}>KPI</span>
            <span style={{ fontSize: '13px', color: D + '0.75)' }}>저장수 · UGC수 · 예약구매 전환율 · 스밍/차트 인증 <span style={{ color: D + '0.45)' }}>(D-4 누적참여 목표 30% 미만 시 총공 목표 하향 재설정)</span></span>
          </div>
        </div>
        <Foot n="08 / 13" label="IF I RAN A COMEBACK" dark={false} />
      </Slide>

      {/* ═══ 챕터 구분 — KiiiKiii 이후 실전 감각 (다크 앵커 + 초대형 넘버) ═══ */}
      <Slide bg={DARK} style={{ justifyContent: 'center' }}>
        {/* 배경 구조물 — 초대형 아웃라인 02 (우상단 블리드, CH01과 대각 대칭) */}
        <span aria-hidden style={{ position: 'absolute', zIndex: -1, right: '30px', top: '-46px', fontFamily: 'var(--font-display)', fontSize: '400px', fontWeight: 400, lineHeight: 0.72, letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: `1.4px ${L}0.12)`, pointerEvents: 'none' }}>02</span>
        <div style={{ paddingLeft: '4px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.2em', color: LINK_TONE.site.dark, marginBottom: '12px' }}>BEYOND FAN PROMOTION</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.02em', color: L + '0.96)', wordBreak: 'keep-all' }}>
            팬 프로모션을 지탱하는 <span style={{ color: L + '0.55)' }}>실전 감각</span>
          </h2>
        </div>
        <div style={{ height: '1px', width: '100%', background: L + '0.16)', marginTop: '28px' }} />
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: L + '0.6)', marginTop: '18px', wordBreak: 'keep-all', maxWidth: '820px' }}>
          KiiiKiii 팬 프로모션의 근거 — 직접 운영해 성과를 낸 SNS 마케팅(개인 · 자린고비)과 웹 · 앱 · 비주얼 작업.
        </p>
        <Foot n="09 / 13" label="CHAPTER 02" />
      </Slide>

      {/* ═══ 8. CONTENT & MARKETING — KiiiKiii와 별개, 개인·자린고비 ═══ */}
      <Slide bg={PAGE} watermark="CONTENT">
        <SectionLabel en="CONTENT & MARKETING" kr="개인 · 자린고비 (KiiiKiii와 별개)" dark={false} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: D + '0.72)', maxWidth: '900px', marginBottom: '26px', wordBreak: 'keep-all' }}>
            위 KiiiKiii와 별개로, <span style={{ fontWeight: 600, color: D + '0.9)' }}>직접 운영한 콘텐츠·SNS 마케팅</span>입니다 — 자린고비 앱 출시·티저, 그리고 개인 채널(@fancy._ju). 팬마케팅 실전 감각의 근거.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
            {contentGroups.map((g) => {
              const m = g.media as any
              const meta = CM_METRIC[g.id] ?? { big: g.receiptMeta, sub: '' }
              const link = m.storeUrl || m.apps?.[0]?.storeUrl || m.tiktokUrl || m.instagramUrl
              const linkLabel = m.storeUrl || m.apps?.[0]?.storeUrl ? '스토어' : '보러가기'
              const handle = m.instagramHandle || m.socialHandle
              const brands = g.id === 'personal' ? ((m.inbounds ?? []) as any[]).map((ib) => IB_NAME[ib.id] ?? ib.category) : null
              let visual: React.ReactNode = null
              if (m.type === 'app-launch' && m.apps?.[0]) {
                const app = m.apps[0]
                visual = (
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {[{ src: app.icon, cap: '앱 아이콘' }, { src: app.qr, cap: '스토어 QR' }].map((x) => (
                      <div key={x.cap} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '118px', height: '118px', backgroundColor: '#fff', backgroundImage: img(x.src, 256) ? `url(${img(x.src, 256)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px' }} />
                        <span style={{ fontSize: '11px', color: D + '0.45)', textAlign: 'center' }}>{x.cap}</span>
                      </div>
                    ))}
                  </div>
                )
              } else if (m.videos?.length) {
                visual = (
                  <div style={{ display: 'flex', gap: '8px', height: '150px' }}>
                    {m.videos.slice(0, 4).map((v: any, i: number) => (
                      <div key={i} style={{ flex: 1, position: 'relative', backgroundColor: '#d8d6d1', backgroundImage: img(v.thumbnail, 256) ? `url(${img(v.thumbnail, 256)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '5px' }}>
                        {/* ▶ 재생 신호 (정지 매체 kinetic) */}
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(10,10,10,0.55)', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '2px' }}>▶</span>
                      </div>
                    ))}
                  </div>
                )
              }
              return (
                <div key={g.id} style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${D}0.2)`, paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', color: D + '0.5)' }}>{g.index}</span>
                    <span style={{ fontSize: '11px', letterSpacing: '0.06em', color: D + '0.5)' }}>{g.label}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '25px', fontWeight: 400, lineHeight: 1.08, color: D + '1)', marginTop: '10px', minHeight: '58px', wordBreak: 'keep-all' }}>{CM_TITLE[g.id] || m.titleEn || g.label}</h3>
                  <div style={{ marginTop: '14px' }}>{visual}</div>
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 400, lineHeight: 1, color: D + '1)' }}>{meta.big}</span>
                    <span style={{ fontSize: '12px', color: D + '0.55)', wordBreak: 'keep-all' }}>{meta.sub}</span>
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '12px', lineHeight: 1.55, color: D + '0.6)', wordBreak: 'keep-all' }}>{CM_DESC[g.id] ?? g.subLines.join(' ')}</p>
                  {brands && brands.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'baseline', wordBreak: 'keep-all' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', color: D + '0.5)', flexShrink: 0 }}>협업 제안</span>
                      <span style={{ fontSize: '12.5px', color: D + '0.85)' }}>{brands.join(', ')}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {handle && <span style={{ fontSize: '12px', color: D + '0.55)' }}>{handle}</span>}
                    {link && <LinkChip href={link} light tone="site">{linkLabel}</LinkChip>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Foot n="10 / 13" label="CONTENT &amp; MARKETING" dark={false} />
      </Slide>

      {/* ═══ 5. 기타 작업 — 웹+앱 작은 썸네일 ═══ */}
      <Slide bg={PAGE} watermark="WORK">
        <SectionLabel en="OTHER WORK" kr="기타 작업 · 웹 & 앱" dark={false} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '28px 20px' }}>
            {otherWeb.map((p) => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <a href={p.siteHref ?? abs(p.studyHref)} style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', backgroundColor: '#d8d6d1', backgroundImage: img(p.thumbnail, 384) ? `url(${img(p.thumbnail, 384)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', filter: p.dimThumb ? 'brightness(0.94)' : undefined }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: D + '0.85)', marginTop: '9px', wordBreak: 'keep-all' }}>{p.wordmark ?? p.title}</span>
                <span style={{ fontSize: '11.5px', color: D + '0.45)', marginTop: '2px', wordBreak: 'keep-all' }}>{p.category}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                  {p.siteHref && <Mini href={p.siteHref} tone="site">실사이트</Mini>}
                  {p.studyHref && <Mini href={abs(p.studyHref)!} tone="case">제작과정</Mini>}
                </div>
              </div>
            ))}
            {mobileProjects.map((m) => {
              const live = m.downloadLinks?.web ?? m.downloadLinks?.playStore
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <a href={live ?? m.studyHref ?? '#'} style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', backgroundColor: '#d8d6d1', backgroundImage: img(m.thumbnail, 384) ? `url(${img(m.thumbnail, 384)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: D + '0.85)', marginTop: '9px', wordBreak: 'keep-all' }}>{m.title} <span style={{ fontSize: '10px', color: D + '0.4)' }}>APP</span></span>
                  <span style={{ fontSize: '11.5px', color: D + '0.45)', marginTop: '2px', wordBreak: 'keep-all' }}>{m.category}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                    {live && <Mini href={live} tone="site">{m.downloadLinks?.playStore ? '스토어' : '실사이트'}</Mini>}
                    {m.studyHref && <Mini href={abs(m.studyHref)!} tone="case">제작과정</Mini>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Foot n="11 / 13" label="OTHER WORK" dark={false} />
      </Slide>

      {/* ═══ 6. VISUAL WORKS ═══ */}
      <Slide bg={PAGE} watermark="VISUAL">
        <SectionLabel en="VISUAL WORKS" kr="포스터 · 배너" dark={false} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: D + '0.45)', marginBottom: '12px' }}>POSTER · {String(posters.length).padStart(2, '0')}</p>
            <div style={{ display: 'flex', gap: '10px', marginInline: '-60px' }}>
              {posters.map((v) => (
                <div key={v.id} style={{ flex: 1, aspectRatio: '4 / 5', backgroundColor: '#d8d6d1', backgroundImage: `url(${img(v.thumbnail, 384)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.16em', color: D + '0.45)', marginBottom: '12px' }}>BANNER · {String(banners.length).padStart(2, '0')}</p>
            <div style={{ display: 'flex', gap: '12px', marginInline: '-60px' }}>
              {banners.map((v) => (
                <div key={v.id} style={{ flex: 1, aspectRatio: '43 / 10', backgroundColor: '#d8d6d1', backgroundImage: `url(${img(v.thumbnail, 640)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ))}
            </div>
          </div>
        </div>
        <Foot n="12 / 13" label="VISUAL WORKS" dark={false} />
      </Slide>

      {/* ═══ 7. CONTACT (다크 — 커버와 수미상관) ═══ */}
      <Slide bg={DARK} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '92px', fontWeight: 400, letterSpacing: '-0.02em', color: L + '1)' }}>{footer.thanks}</h2>
        <p style={{ fontSize: '16px', color: L + '0.55)', marginTop: '18px' }}>{footer.thanksKr}</p>
        <div style={{ marginTop: '48px', display: 'flex', gap: '28px', fontSize: '15px' }}>
          <LinkChip href={`mailto:${footer.email}`}>{footer.email}</LinkChip>
          <LinkChip href={footer.github}>{footer.githubLabel}</LinkChip>
          <LinkChip href={footer.notion} tone="site">Notion</LinkChip>
        </div>
        <p style={{ position: 'absolute', bottom: '58px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', color: L + '0.35)' }}>{footer.copyright}</p>
        <Foot n="13 / 13" label="CONTACT" />
      </Slide>
    </div>
  )
}

/* ── About Index 소분류 블록 (라이트 슬라이드 전용) ── */
function IndexBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.14em', color: D + '0.5)', marginBottom: '10px' }}>{title}</p>
      {children}
    </div>
  )
}
function IdxRow({ children, dim = false }: { children: React.ReactNode; dim?: boolean }) {
  return <div style={{ fontSize: '13.5px', lineHeight: 1.8, color: dim ? D + '0.5)' : D + '0.82)' }}>{children}</div>
}

import { experienceGroups } from '@/data/experience'

/**
 * Experience & Activities — About ↔ Web Projects 사이.
 *
 * 구조: 섹션 타이틀 → 카테고리별(라벨 + hairline) 3열 그리드.
 * 각 항목: 기간(mono) · 제목(테두리 선 박스 — 채움·글라스 X) · 세부 bullet.
 * 정적 렌더(애니 없음) — 기존 섹션 로직과 격리.
 */
export function Experience() {
  return (
    <section
      id="experience"
      data-section="experience"
      className="relative bg-dark px-side-m py-[16vh] text-ink-inverse md:px-side-t xl:px-side-d"
    >
      <div className="mx-auto max-w-[1680px]">
        {/* 섹션 타이틀 */}
        <h2
          className="font-display font-medium leading-[0.95] tracking-tight text-ink-inverse"
          style={{ fontSize: 'clamp(40px, 4.4vw, 72px)' }}
        >
          Experience &amp; Activities
        </h2>

        {/* 카테고리 그룹 */}
        <div className="mt-[9vh] flex flex-col gap-[10vh]">
          {experienceGroups.map((group) => (
            <div key={group.category}>
              {/* 카테고리 라벨 + hairline */}
              <div className="flex items-center gap-5">
                <span className="font-mono text-label uppercase tracking-[0.16em] text-ink-inverse/70">
                  {group.category}
                </span>
                <span className="h-px flex-1 bg-ink-inverse/15" aria-hidden />
              </div>

              {/* 3열 그리드 */}
              <div className="mt-9 grid grid-cols-1 gap-x-gutter-d gap-y-12 md:grid-cols-3">
                {group.items.map((item, i) => (
                  <div key={i}>
                    {/* 기간 */}
                    <span
                      className="block font-mono uppercase tracking-[0.1em] text-ink-inverse/45"
                      style={{ fontSize: 'clamp(11px, 0.72vw, 13px)' }}
                    >
                      {item.period}
                    </span>

                    {/* 제목 — 테두리 선 박스 (채움·글라스 X) */}
                    <div
                      className="mt-3 rounded-lg border border-ink-inverse/40 px-5 py-3.5 text-center font-kr font-medium text-ink-inverse transition-colors duration-300 hover:border-ink-inverse/70"
                      style={{ fontSize: 'clamp(14px, 1vw, 16px)', lineHeight: 1.4 }}
                    >
                      {item.title}
                    </div>

                    {/* 세부 설명 */}
                    {item.details.length > 0 && (
                      <ul className="mt-4 flex flex-col gap-1.5">
                        {item.details.map((d, j) => (
                          <li
                            key={j}
                            className="font-kr text-ink-inverse/60"
                            style={{ fontSize: 'clamp(13px, 0.8vw, 14px)', lineHeight: 1.6 }}
                          >
                            {`- ${d}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

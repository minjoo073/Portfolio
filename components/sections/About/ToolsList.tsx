interface ToolsListProps {
  tools: readonly string[]
}

/**
 * Tools 배열 — Career Snapshot 하단.
 * Phase 3에서 hover x-shift + weight 변경 모션 적용.
 */
export function ToolsList({ tools }: ToolsListProps) {
  return (
    <ul
      className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-body uppercase tracking-[0.04em] text-ink-inverse"
      data-tools
    >
      {tools.map(tool => (
        <li key={tool} data-tool={tool}>
          {tool}
        </li>
      ))}
    </ul>
  )
}

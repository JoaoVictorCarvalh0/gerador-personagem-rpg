interface IconProps {
  name: string
  size?: number
  variant?: 'line' | 'forjado'
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}

const PATHS: Record<string, React.ReactNode> = {
  sword: (
    <g>
      <path d="M12 2.5 L13.4 6.4 V14 H10.6 V6.4 Z" />
      <path d="M7.6 14 H16.4" />
      <path d="M12 14 V18.6" />
      <path d="M9.8 18.6 H14.2" />
    </g>
  ),
  wand: (
    <g>
      <path d="M7 19.5 L14.5 7" />
      <path d="M17 3 L18 6 L21 7 L18 8 L17 11 L16 8 L13 7 L16 6 Z" />
    </g>
  ),
  bow: (
    <g>
      <path d="M7.5 3 C 16 6.5, 16 17.5, 7.5 21" />
      <path d="M7.5 3 L7.5 21" />
      <path d="M5 12 H19" />
      <path d="M16 9 L19 12 L16 15" />
      <path d="M5 12 L7.3 9.7 M5 12 L7.3 14.3" />
    </g>
  ),
  dagger: (
    <g>
      <path d="M12 3 L13 7.2 V12 H11 V7.2 Z" />
      <path d="M9.2 12 H14.8" />
      <path d="M12 12 V17" />
      <path d="M10.4 17 H13.6" />
    </g>
  ),
  chalice: (
    <g>
      <path d="M7.5 5.4 H16.5 L15.4 9.2 C14 12.2 10 12.2 8.6 9.2 Z" />
      <path d="M12 12 V18" />
      <path d="M8.6 19 H15.4" />
      <path d="M12 2.4 V4.4 M10.6 3.4 H13.4" />
    </g>
  ),
  shield: (
    <g>
      <path d="M12 2.8 L20 5.8 V11.5 C20 16.5 16.4 19.6 12 21.5 C7.6 19.6 4 16.5 4 11.5 V5.8 Z" />
    </g>
  ),
  burst: (
    <g>
      <path d="M12 3 V6.5 M12 17.5 V21 M3 12 H6.5 M17.5 12 H21" />
      <path d="M6.3 6.3 L8.8 8.8 M15.2 15.2 L17.7 17.7 M17.7 6.3 L15.2 8.8 M8.8 15.2 L6.3 17.7" />
      <circle cx="12" cy="12" r="2.6" />
    </g>
  ),
  speed: (
    <g>
      <path d="M13 2.5 L5 13 H11 L9.5 21.5 L19 9 H12 Z" />
    </g>
  ),
  human: (
    <g>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20.5 C6 15 18 15 18.5 20.5" />
    </g>
  ),
  elf: (
    <g>
      <circle cx="11.4" cy="8.4" r="3.2" />
      <path d="M14 6.6 L18 3.6 L15.2 8.4" />
      <path d="M5.5 20.5 C6 15.5 17 15.5 17.6 20.5" />
    </g>
  ),
  dwarf: (
    <g>
      <path d="M9 3 V21" />
      <path d="M9 5 H14 C18.5 5 18.5 11.5 14 11.5 H9" />
    </g>
  ),
  halfling: (
    <g>
      <circle cx="9.2" cy="9.8" r="3" />
      <circle cx="14.8" cy="9.8" r="3" />
      <circle cx="12" cy="6.6" r="3" />
      <path d="M12 12 V20" />
    </g>
  ),
  tiefling: (
    <g>
      <path d="M7 15.5 C3.8 12 5 6 9 5" />
      <path d="M17 15.5 C20.2 12 19 6 15 5" />
      <path d="M9 5 C11 7.2 13 7.2 15 5" />
      <circle cx="10" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11.4" r="0.9" fill="currentColor" stroke="none" />
    </g>
  ),
  d20: (
    <g>
      <path d="M12 2.6 L20 7.2 V16.8 L12 21.4 L4 16.8 V7.2 Z" />
      <path d="M12 6.6 L16.6 15 H7.4 Z" />
      <path d="M12 6.6 V2.6 M7.4 15 L4 16.8 M16.6 15 L20 16.8 M7.4 15 L4 7.2 M16.6 15 L20 7.2" />
    </g>
  ),
  refresh: (
    <g>
      <path d="M19 5.5 V9.5 H15" />
      <path d="M5 18.5 V14.5 H9" />
      <path d="M18.4 9.5 A7 7 0 0 0 6.2 7.4 M5.6 14.5 A7 7 0 0 0 17.8 16.6" />
    </g>
  ),
  check: (
    <g>
      <path d="M5 12.5 L10 17.5 L19 6.5" />
    </g>
  ),
}

export function Icon({ name, size = 24, variant = 'line', strokeWidth, className, style }: IconProps) {
  const inner = PATHS[name]
  if (!inner) return null
  const sw = strokeWidth != null ? strokeWidth : variant === 'forjado' ? 2.2 : 1.55
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
    >
      {inner}
    </svg>
  )
}

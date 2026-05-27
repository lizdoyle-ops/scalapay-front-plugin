interface ApiBannerProps {
  variant: 'warning' | 'error' | 'loading' | 'live'
  message: string
}

const STYLES = {
  warning: { wrap: 'border-amber-200 bg-amber-50', icon: '⚠', text: 'text-amber-700' },
  error:   { wrap: 'border-red-200 bg-red-50',     icon: '✕', text: 'text-red-700' },
  loading: { wrap: 'border-gray-200 bg-gray-50',   icon: '↻', text: 'text-gray-500' },
  live:    { wrap: 'border-green-200 bg-green-50', icon: '✓', text: 'text-green-700' },
}

export default function ApiBanner({ variant, message }: ApiBannerProps) {
  const s = STYLES[variant]
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${s.wrap}`}>
      <span className={`text-[11px] flex-shrink-0 ${s.text} ${variant === 'loading' ? 'animate-spin inline-block' : ''}`}>
        {s.icon}
      </span>
      <p className={`text-[11px] leading-snug ${s.text}`}>{message}</p>
    </div>
  )
}

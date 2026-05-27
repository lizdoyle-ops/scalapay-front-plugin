interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:       { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Active' },
  suspended:    { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Suspended' },
  under_review: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Under Review' },
  // Refund statuses
  none:         { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'No Refund' },
  requested:    { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Refund Requested' },
  approved:     { bg: 'bg-[#E6F7F6]',  text: 'text-[#008B84]',   dot: 'bg-[#00B2A9]',   label: 'Approved' },
  processed:    { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Processed' },
  // Jira statuses
  Open:         { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'Open' },
  'In Progress':{ bg: 'bg-[#E6F7F6]',  text: 'text-[#008B84]',   dot: 'bg-[#00B2A9]',   label: 'In Progress' },
  Done:         { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Done' },
  // Fraud scores
  low:          { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Low Risk' },
  medium:       { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Medium Risk' },
  high:         { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'High Risk' },
  // Jira priorities
  Low:          { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'Low' },
  Medium:       { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Medium' },
  High:         { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'High' },
  Critical:     { bg: 'bg-red-200',     text: 'text-red-800',     dot: 'bg-red-700',     label: 'Critical' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = CONFIG[status] ?? {
    bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: status,
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${cfg.bg} ${cfg.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils.js'
import type { AgentStatus, SessionStatus } from '../../types/index.js'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        idle: 'bg-gray-100 text-gray-600',
        working: 'bg-blue-100 text-blue-700',
        reviewing: 'bg-yellow-100 text-yellow-700',
        done: 'bg-green-100 text-green-700',
        error: 'bg-red-100 text-red-700',
        pending: 'bg-gray-100 text-gray-600',
        clarifying: 'bg-purple-100 text-purple-700',
        running: 'bg-blue-100 text-blue-700',
        awaiting_approval: 'bg-orange-100 text-orange-700',
        completed: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
      },
    },
    defaultVariants: { variant: 'idle' },
  },
)

// 상태 한국어 레이블
const STATUS_LABEL: Record<AgentStatus | SessionStatus, string> = {
  idle: '대기',
  working: '작업 중',
  reviewing: '검토 중',
  done: '완료',
  error: '오류',
  pending: '대기',
  clarifying: '질문 중',
  running: '실행 중',
  awaiting_approval: '승인 대기',
  completed: '완료',
  failed: '실패',
}

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  status: AgentStatus | SessionStatus
  className?: string
  showDot?: boolean
}

export function Badge({ status, className, showDot = true }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant: status }), className)}>
      {showDot && status === 'working' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {STATUS_LABEL[status]}
    </span>
  )
}

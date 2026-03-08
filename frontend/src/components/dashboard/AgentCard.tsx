import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils.js'
import { Badge } from '../ui/Badge.js'
import type { AgentState, AgentName } from '../../types/index.js'

// 에이전트 한국어 이름 및 설명
const AGENT_INFO: Record<AgentName, { label: string; description: string; icon: string }> = {
  manager:   { label: '매니저',  description: '지시 분석 및 명확화',    icon: '🎯' },
  planner:   { label: '기획자',  description: 'PRD 문서 작성',          icon: '📋' },
  designer:  { label: '디자이너', description: 'UI 구조 설계',           icon: '🎨' },
  developer: { label: '개발자',  description: '코드 생성',              icon: '💻' },
  qa:        { label: 'QA',      description: '코드 검토 및 품질 보증',  icon: '🔍' },
}

const cardVariants = cva(
  'rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
  {
    variants: {
      status: {
        idle:      'border-gray-200 bg-gray-50 opacity-60',
        working:   'border-blue-300 bg-blue-50 shadow-sm',
        reviewing: 'border-yellow-300 bg-yellow-50',
        done:      'border-green-300 bg-green-50',
        error:     'border-red-300 bg-red-50',
      },
    },
    defaultVariants: { status: 'idle' },
  },
)

interface AgentCardProps {
  agent: AgentState
  onClick: (agent: AgentState) => void
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const info = AGENT_INFO[agent.name]

  return (
    <div
      className={cn(cardVariants({ status: agent.status }))}
      onClick={() => onClick(agent)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(agent)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* 아이콘 + 로딩 스피너 */}
          <div className="relative flex-shrink-0">
            <span className="text-2xl">{info.icon}</span>
            {agent.status === 'working' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{info.label}</p>
            <p className="text-xs text-gray-500">{info.description}</p>
          </div>
        </div>
        <Badge status={agent.status} />
      </div>

      {/* 완료 시 간략 결과 미리보기 */}
      {agent.status === 'done' && agent.output && (
        <p className="mt-3 text-xs text-gray-600 line-clamp-2 border-t border-gray-200 pt-2">
          {agent.output.slice(0, 100)}…
        </p>
      )}

      {/* 에러 메시지 */}
      {agent.status === 'error' && agent.error && (
        <p className="mt-2 text-xs text-red-600 border-t border-red-200 pt-2">
          {agent.error}
        </p>
      )}
    </div>
  )
}

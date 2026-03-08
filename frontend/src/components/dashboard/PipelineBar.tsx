import { cn } from '../../lib/utils.js'
import type { PipelineState, AgentName } from '../../types/index.js'

const STEPS: { name: AgentName; label: string }[] = [
  { name: 'manager',   label: '매니저'  },
  { name: 'planner',   label: '기획자'  },
  { name: 'designer',  label: '디자이너' },
  { name: 'developer', label: '개발자'  },
  { name: 'qa',        label: 'QA'      },
]

interface PipelineBarProps {
  pipeline: PipelineState
}

export function PipelineBar({ pipeline }: PipelineBarProps) {
  const progressPercent = Math.round((pipeline.currentStep / (STEPS.length - 1)) * 100)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">파이프라인 진행 상황</p>
        <span className="text-xs text-gray-500">{progressPercent}%</span>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const agent = pipeline.agents[step.name]
          const isActive = agent.status === 'working'
          const isDone = agent.status === 'done'
          const isError = agent.status === 'error'

          return (
            <div key={step.name} className="flex items-center flex-1 min-w-0">
              {/* 스텝 원형 */}
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    isDone  && 'bg-green-500 text-white',
                    isActive && 'bg-blue-500 text-white ring-4 ring-blue-200 animate-pulse',
                    isError  && 'bg-red-500 text-white',
                    !isDone && !isActive && !isError && 'bg-gray-200 text-gray-400',
                  )}
                >
                  {isDone  && '✓'}
                  {isError  && '✕'}
                  {!isDone && !isError && (idx + 1)}
                </div>
                <p className={cn(
                  'text-xs mt-1 truncate w-full text-center',
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-400',
                )}>
                  {step.label}
                </p>
              </div>

              {/* 연결선 */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-1 mb-4 transition-all',
                    isDone ? 'bg-green-400' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* QA 반복 표시 */}
      {pipeline.qaIteration > 0 && (
        <p className="text-xs text-gray-400 text-right mt-1">
          QA 반복 {pipeline.qaIteration}/3
        </p>
      )}
    </div>
  )
}

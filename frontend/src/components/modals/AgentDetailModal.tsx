import { Dialog } from '../ui/Dialog.js'
import { Badge } from '../ui/Badge.js'
import type { AgentState, AgentName } from '../../types/index.js'

const AGENT_LABEL: Record<AgentName, string> = {
  manager:   '🎯 매니저',
  planner:   '📋 기획자',
  designer:  '🎨 디자이너',
  developer: '💻 개발자',
  qa:        '🔍 QA',
}

interface AgentDetailModalProps {
  agent: AgentState | null
  open: boolean
  onClose: () => void
}

export function AgentDetailModal({ agent, open, onClose }: AgentDetailModalProps) {
  if (!agent) return null

  // 개발자 에이전트: 파일 수 표시
  const isDevOutput = agent.name === 'developer' && agent.output
  let devInfo: { fileCount: number } | null = null
  if (isDevOutput) {
    try {
      devInfo = JSON.parse(agent.output!) as { fileCount: number }
    } catch {
      devInfo = null
    }
  }

  // QA 에이전트: 구조화된 결과 표시
  const isQAOutput = agent.name === 'qa' && agent.output
  let qaInfo: { passed: boolean; feedback: string; issues: string[] } | null = null
  if (isQAOutput) {
    try {
      qaInfo = JSON.parse(agent.output!) as { passed: boolean; feedback: string; issues: string[] }
    } catch {
      qaInfo = null
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={AGENT_LABEL[agent.name]} size="xl">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Badge status={agent.status} />
          {agent.startedAt && (
            <span className="text-xs text-gray-400">
              시작: {new Date(agent.startedAt).toLocaleTimeString('ko-KR')}
            </span>
          )}
          {agent.completedAt && (
            <span className="text-xs text-gray-400">
              완료: {new Date(agent.completedAt).toLocaleTimeString('ko-KR')}
            </span>
          )}
        </div>

        {/* 에러 표시 */}
        {agent.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-1">오류 발생</p>
            <p className="text-sm text-red-700">{agent.error}</p>
          </div>
        )}

        {/* 개발자: 파일 수 요약 */}
        {devInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              총 <strong>{devInfo.fileCount}개</strong> 파일이 생성되었습니다.
              결과 패널의 코드 탭에서 확인하세요.
            </p>
          </div>
        )}

        {/* QA: 구조화 결과 */}
        {qaInfo && (
          <div className={`border rounded-lg p-4 ${qaInfo.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm font-bold mb-2 ${qaInfo.passed ? 'text-green-800' : 'text-red-800'}`}>
              {qaInfo.passed ? '✅ QA 통과' : '❌ QA 실패'}
            </p>
            <p className="text-sm text-gray-700 mb-3">{qaInfo.feedback}</p>
            {qaInfo.issues.length > 0 && (
              <ul className="space-y-1">
                {qaInfo.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-red-400">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 일반 텍스트 출력 (마크다운) */}
        {!devInfo && !qaInfo && agent.output && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto max-h-[60vh]">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {agent.output}
            </pre>
          </div>
        )}

        {/* 아직 출력 없음 */}
        {!agent.output && !agent.error && (
          <p className="text-sm text-gray-400 text-center py-8">
            {agent.status === 'idle' ? '아직 실행되지 않았습니다.' : '작업 중입니다...'}
          </p>
        )}
      </div>
    </Dialog>
  )
}

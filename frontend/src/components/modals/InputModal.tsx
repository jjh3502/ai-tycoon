import { useState } from 'react'
import { Dialog } from '../ui/Dialog.js'
import { Button } from '../ui/Button.js'

interface InputModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (instruction: string) => void
  isLoading: boolean
  // 추가 질문 모드
  clarificationMode?: boolean
  clarificationQuestions?: string[]
  onSubmitClarification?: (answer: string) => void
  // UI 승인 모드
  approvalMode?: boolean
  uiDesign?: string
  onApprove?: () => void
}

const MAX_LENGTH = 2000

export function InputModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  clarificationMode = false,
  clarificationQuestions = [],
  onSubmitClarification,
  approvalMode = false,
  uiDesign = '',
  onApprove,
}: InputModalProps) {
  const [text, setText] = useState('')

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed) return
    if (clarificationMode && onSubmitClarification) {
      onSubmitClarification(trimmed)
    } else {
      onSubmit(trimmed)
    }
    setText('')
  }

  // 승인 모드
  if (approvalMode) {
    return (
      <Dialog open={open} onClose={onClose} title="🎨 UI 설계 확인" size="xl">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            디자이너가 아래와 같이 UI 구조를 설계했습니다. 이 방향으로 개발을 진행할까요?
          </p>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto max-h-96">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {uiDesign}
            </pre>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>
              다시 검토
            </Button>
            <Button onClick={onApprove} isLoading={isLoading}>
              ✅ 승인하고 개발 시작
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }

  // 추가 질문 모드
  if (clarificationMode) {
    return (
      <Dialog open={open} onClose={onClose} title="📋 추가 정보가 필요해요" size="lg">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            더 정확한 앱을 만들기 위해 아래 질문에 답해주세요.
          </p>
          <ul className="space-y-2">
            {clarificationQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-800">
                <span className="text-indigo-500 font-bold flex-shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={4}
            placeholder="위 질문들에 대한 답변을 자유롭게 작성해주세요..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length} / {MAX_LENGTH}</span>
            <Button onClick={handleSubmit} isLoading={isLoading} disabled={!text.trim()}>
              답변 제출
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }

  // 기본 입력 모드
  return (
    <Dialog open={open} onClose={onClose} title="💡 어떤 앱을 만들까요?" size="lg">
      <div className="p-6 flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          만들고 싶은 앱을 자유롭게 설명해주세요. AI 팀이 자동으로 기획하고 개발합니다.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={5}
          placeholder="예) 직원 10명의 근태를 관리하는 앱 만들어줘. 출퇴근 시간 기록하고 월별 통계 볼 수 있으면 좋겠어."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
          }}
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {text.length} / {MAX_LENGTH} · Ctrl+Enter로 제출
          </span>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!text.trim()}>
            🚀 앱 만들기
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

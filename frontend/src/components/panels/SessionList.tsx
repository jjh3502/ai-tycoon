import { useState } from 'react'
import { Badge } from '../ui/Badge.js'
import type { Session } from '../../types/index.js'

interface SessionListProps {
  sessions: Session[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<boolean>
}

export function SessionList({ sessions, selectedId, onSelect, onDelete }: SessionListProps) {
  // 삭제 확인 중인 세션 ID
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleConfirmDelete() {
    if (!confirmId) return
    await onDelete(confirmId)
    setConfirmId(null)
  }

  if (sessions.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        아직 작업 기록이 없습니다.
      </p>
    )
  }

  return (
    <>
      <ul className="space-y-1">
        {sessions.map((session) => (
          <li key={session.id} className="group relative">
            <button
              onClick={() => onSelect(session.id)}
              className={`w-full text-left rounded-lg px-3 py-2 pr-8 transition-colors ${
                selectedId === session.id
                  ? 'bg-indigo-50 border border-indigo-200'
                  : 'hover:bg-gray-100 border border-transparent'
              }`}
            >
              <p className="text-xs font-medium text-gray-800 truncate">
                {session.instruction}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={session.status} showDot={false} />
                <span className="text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </button>

            {/* X 삭제 버튼 — 호버 시 표시 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmId(session.id)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="삭제"
              title="삭제"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* 삭제 확인 다이얼로그 */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <p className="font-semibold text-gray-900 mb-2">작업을 삭제할까요?</p>
            <p className="text-sm text-gray-500 mb-6">
              삭제한 작업은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                아니오
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                예, 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

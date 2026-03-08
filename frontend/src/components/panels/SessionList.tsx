import { Badge } from '../ui/Badge.js'
import type { Session } from '../../types/index.js'

interface SessionListProps {
  sessions: Session[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function SessionList({ sessions, selectedId, onSelect }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        아직 작업 기록이 없습니다.
      </p>
    )
  }

  return (
    <ul className="space-y-1">
      {sessions.map((session) => (
        <li key={session.id}>
          <button
            onClick={() => onSelect(session.id)}
            className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
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
        </li>
      ))}
    </ul>
  )
}

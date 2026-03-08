import type { TokenUsage } from '../../types/index.js'

interface TokenWarningProps {
  usage: TokenUsage
}

export function TokenWarning({ usage }: TokenWarningProps) {
  const percent = Math.round((usage.used / usage.limit) * 100)
  const isExceeded = usage.isExceeded

  return (
    <div className={`border-b px-6 py-2 ${isExceeded ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <p className={`text-sm text-center ${isExceeded ? 'text-red-800' : 'text-amber-800'}`}>
        {isExceeded ? '🚫' : '⚠️'}{' '}
        {isExceeded
          ? `이번 달 AI 사용 한도(${usage.limit.toLocaleString()} 토큰)를 초과했습니다. 다음 달까지 이용이 제한됩니다.`
          : `이번 달 AI 사용량이 ${percent}%에 도달했습니다. (${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()} 토큰)`
        }
      </p>
    </div>
  )
}

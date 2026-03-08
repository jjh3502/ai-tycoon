import { useEffect } from 'react'
import { useTokens, startTokenPolling, stopTokenPolling } from './hooks/useTokens.js'
import { useSessions } from './hooks/useSessions.js'

// Phase 6에서 추가될 컴포넌트 (임시 플레이스홀더)
function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">AI 타이쿤</h1>
          <span className="text-sm text-gray-500">— AI가 만들어주는 내 앱</span>
        </div>
      </div>
    </header>
  )
}

function TokenWarningBanner({ used, limit }: { used: number; limit: number }) {
  const percent = Math.round((used / limit) * 100)
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
      <p className="text-sm text-amber-800 text-center">
        ⚠️ 이번 달 AI 사용량이 {percent}%에 도달했습니다.
        ({used.toLocaleString()} / {limit.toLocaleString()} 토큰)
      </p>
    </div>
  )
}

export default function App() {
  const { usage, fetch: fetchTokens } = useTokens()
  const { fetchSessions } = useSessions()

  // 토큰 30초 폴링 시작
  useEffect(() => {
    startTokenPolling(fetchTokens)
    return () => stopTokenPolling()
  }, [fetchTokens])

  // 초기 세션 목록 조회
  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* 토큰 경고 배너 */}
      {usage?.isWarning && (
        <TokenWarningBanner used={usage.used} limit={usage.limit} />
      )}

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden max-w-screen-xl mx-auto w-full">
        {/* 사이드바: 세션 목록 (Phase 6에서 구현) */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">
            이전 작업
          </p>
          <p className="text-sm text-gray-500">세션 목록이 여기에 표시됩니다.</p>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                어떤 앱을 만들어드릴까요?
              </h2>
              <p className="text-gray-500">
                자연어로 지시하면 AI 팀이 자동으로 앱을 만들어드립니다.
              </p>
            </div>
            {/* 입력 모달 및 에이전트 카드는 Phase 6에서 추가 */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-2xl text-center text-gray-400">
              UI 컴포넌트 구현 예정 (Phase 6)
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

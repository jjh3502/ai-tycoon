import { useEffect, useState } from 'react'
import { useTokens, startTokenPolling, stopTokenPolling } from './hooks/useTokens.js'
import { useSessions } from './hooks/useSessions.js'
import { useWorkflow } from './hooks/useWorkflow.js'
import { TokenWarning } from './components/dashboard/TokenWarning.js'
import { AgentCard } from './components/dashboard/AgentCard.js'
import { PipelineBar } from './components/dashboard/PipelineBar.js'
import { InputModal } from './components/modals/InputModal.js'
import { AgentDetailModal } from './components/modals/AgentDetailModal.js'
import { ResultPanel } from './components/panels/ResultPanel.js'
import { SessionList } from './components/panels/SessionList.js'
import { Button } from './components/ui/Button.js'
import type { AgentState, AgentName } from './types/index.js'

// 에이전트 순서
const AGENT_ORDER: AgentName[] = ['manager', 'planner', 'designer', 'developer', 'qa']

export default function App() {
  const { usage, fetch: fetchTokens } = useTokens()
  const { sessions, selectedSession, fetchSessions, selectSession, clearSelection } = useSessions()
  const {
    status, pipeline, files, isLoading,
    clarificationQuestions, uiDesign,
    run, retry, submitClarification, approveDesign, reset,
  } = useWorkflow()

  const [inputOpen, setInputOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null)

  // 토큰 30초 폴링
  useEffect(() => {
    startTokenPolling(fetchTokens)
    return () => stopTokenPolling()
  }, [fetchTokens])

  // 초기 세션 목록 조회
  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  // 완료 시 세션 목록 갱신
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      void fetchSessions()
    }
  }, [status, fetchSessions])

  function handleNewApp() {
    reset()
    clearSelection()
    setInputOpen(true)
  }

  function handleRun(instruction: string) {
    setInputOpen(false)
    void run(instruction)
  }

  function handleClarification(answer: string) {
    setInputOpen(false)
    void submitClarification(answer)
  }

  function handleApprove() {
    void approveDesign()
  }

  // 추가 질문 모달 자동 열기
  useEffect(() => {
    if (status === 'clarifying') setInputOpen(true)
  }, [status])

  // 승인 요청 모달 자동 열기
  useEffect(() => {
    if (status === 'awaiting_approval') setInputOpen(true)
  }, [status])

  // 세션 선택 시 해당 결과 표시
  async function handleSelectSession(id: string) {
    reset()
    await selectSession(id)
  }

  // 현재 표시할 파이프라인과 파일 (진행 중 or 선택된 세션)
  const displayPipeline = pipeline ?? selectedSession?.pipeline ?? null
  const displayFiles    = files.length > 0 ? files : (selectedSession?.files ?? [])

  const isRunning = isLoading || status === 'running'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">AI 개발회사</h1>
            <span className="text-sm text-gray-400 hidden sm:block">— AI가 만들어주는 내 앱</span>
          </div>
          <Button onClick={handleNewApp} size="sm" disabled={isRunning}>
            + 새 앱 만들기
          </Button>
        </div>
      </header>

      {/* 토큰 경고 배너 */}
      {usage?.isWarning && <TokenWarning usage={usage} />}

      {/* 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바: 세션 목록 */}
        <aside className="w-60 border-r border-gray-200 bg-white flex-shrink-0 hidden md:flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">이전 작업</p>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <SessionList
              sessions={sessions}
              selectedId={selectedSession?.id ?? null}
              onSelect={handleSelectSession}
            />
          </div>
        </aside>

        {/* 메인 영역 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">

            {/* 초기 화면 */}
            {!displayPipeline && !isRunning && (
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                <div className="text-6xl">🤖</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    어떤 앱을 만들어드릴까요?
                  </h2>
                  <p className="text-gray-500 max-w-md">
                    자연어로 지시하면 5명의 AI 팀원이 자동으로 기획·설계·개발·검토를 완료합니다.
                  </p>
                </div>
                <Button size="lg" onClick={handleNewApp}>
                  🚀 앱 만들기 시작
                </Button>
              </div>
            )}

            {/* 로딩 중 */}
            {isRunning && !displayPipeline && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">AI 팀이 작업 중입니다...</p>
              </div>
            )}

            {/* 파이프라인 진행 상황 */}
            {displayPipeline && (
              <>
                <PipelineBar pipeline={displayPipeline} />

                {/* 에이전트 카드 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {AGENT_ORDER.map((name) => (
                    <AgentCard
                      key={name}
                      agent={displayPipeline.agents[name]}
                      onClick={setSelectedAgent}
                    />
                  ))}
                </div>

                {/* 결과 패널 (완료 or 선택된 세션) */}
                {(status === 'completed' || selectedSession?.status === 'completed') && (
                  <div className="h-[600px]">
                    <ResultPanel pipeline={displayPipeline} files={displayFiles} />
                  </div>
                )}

                {/* 실패 안내 */}
                {(status === 'failed' || selectedSession?.status === 'failed') && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-800 font-semibold mb-2">❌ 작업 중 오류가 발생했습니다</p>
                    <p className="text-red-600 text-sm mb-4">에이전트 카드를 클릭하여 오류 내용을 확인하세요.</p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="secondary" onClick={handleNewApp}>새 지시 입력</Button>
                      <Button onClick={() => void retry()} isLoading={isLoading}>같은 내용으로 재시도</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* 입력 모달 */}
      <InputModal
        open={inputOpen}
        onClose={() => setInputOpen(false)}
        onSubmit={handleRun}
        isLoading={isRunning}
        clarificationMode={status === 'clarifying'}
        clarificationQuestions={clarificationQuestions}
        onSubmitClarification={handleClarification}
        approvalMode={status === 'awaiting_approval'}
        uiDesign={uiDesign ?? ''}
        onApprove={handleApprove}
      />

      {/* 에이전트 상세 모달 */}
      <AgentDetailModal
        agent={selectedAgent}
        open={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  )
}

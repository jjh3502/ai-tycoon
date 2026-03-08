import { useState } from 'react'
import type { PipelineState, FileOutput } from '../../types/index.js'

type Tab = 'prd' | 'design' | 'code' | 'qa'

interface ResultPanelProps {
  pipeline: PipelineState
  files: FileOutput[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 접근 실패 시 무시
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
    >
      {copied ? '✓ 복사됨' : '복사'}
    </button>
  )
}

export function ResultPanel({ pipeline, files }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('prd')
  const [selectedFile, setSelectedFile] = useState<string | null>(
    files[0]?.path ?? null,
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'prd',    label: '📋 PRD'   },
    { id: 'design', label: '🎨 설계'  },
    { id: 'code',   label: '💻 코드'  },
    { id: 'qa',     label: '🔍 QA'   },
  ]

  const prdOutput    = pipeline.agents.planner.output ?? ''
  const designOutput = pipeline.agents.designer.output ?? ''
  const qaOutput     = pipeline.agents.qa.output ?? ''

  interface QAInfo { passed: boolean; feedback: string; issues: string[] }
  let qaInfo: QAInfo | null = null
  try {
    if (qaOutput) qaInfo = JSON.parse(qaOutput) as QAInfo
  } catch { /* 무시 */ }

  const currentFile = files.find((f) => f.path === selectedFile)

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200 px-4 pt-3 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-hidden">

        {/* PRD 탭 */}
        {activeTab === 'prd' && (
          <div className="h-full overflow-auto p-4">
            {prdOutput ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {prdOutput}
              </pre>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">PRD가 아직 생성되지 않았습니다.</p>
            )}
          </div>
        )}

        {/* 설계 탭 */}
        {activeTab === 'design' && (
          <div className="h-full overflow-auto p-4">
            {designOutput ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {designOutput}
              </pre>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">UI 설계가 아직 생성되지 않았습니다.</p>
            )}
          </div>
        )}

        {/* 코드 탭 */}
        {activeTab === 'code' && (
          <div className="flex h-full overflow-hidden">
            {/* 파일 목록 */}
            <div className="w-56 border-r border-gray-200 overflow-auto flex-shrink-0">
              {files.length === 0 ? (
                <p className="text-xs text-gray-400 p-4 text-center">파일 없음</p>
              ) : (
                files.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(f.path)}
                    className={`w-full text-left px-3 py-2 text-xs truncate border-b border-gray-100 transition-colors ${
                      selectedFile === f.path
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={f.path}
                  >
                    {f.path}
                  </button>
                ))
              )}
            </div>

            {/* 코드 뷰어 */}
            <div className="flex-1 overflow-auto bg-gray-900 relative">
              {currentFile ? (
                <>
                  <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-xs text-gray-400 font-mono">{currentFile.path}</span>
                    <CopyButton text={currentFile.content} />
                  </div>
                  <pre className="p-4 text-sm text-gray-200 font-mono leading-relaxed overflow-auto">
                    {currentFile.content}
                  </pre>
                </>
              ) : (
                <p className="text-gray-500 text-sm text-center py-12">파일을 선택하세요.</p>
              )}
            </div>
          </div>
        )}

        {/* QA 탭 */}
        {activeTab === 'qa' && (
          <div className="h-full overflow-auto p-4">
            {qaInfo ? (
              <div className="flex flex-col gap-4">
                <div className={`rounded-lg p-4 ${qaInfo.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-bold text-sm ${qaInfo.passed ? 'text-green-800' : 'text-red-800'}`}>
                    {qaInfo.passed ? '✅ QA 통과' : '❌ QA 실패'}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{qaInfo.feedback}</p>
                </div>
                {qaInfo.issues.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">발견된 이슈</p>
                    <ul className="space-y-1">
                      {qaInfo.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-red-400 flex-shrink-0">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">QA 결과가 아직 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

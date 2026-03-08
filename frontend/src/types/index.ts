// 에이전트 상태 타입
export type AgentStatus = 'idle' | 'working' | 'reviewing' | 'done' | 'error'

// 세션 상태 타입
export type SessionStatus =
  | 'pending'
  | 'clarifying'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'

// 에이전트 이름 타입
export type AgentName = 'manager' | 'planner' | 'designer' | 'developer' | 'qa'

// 파일 출력
export interface FileOutput {
  path: string
  content: string
  language: string
}

// 토큰 사용량
export interface TokenUsage {
  used: number
  limit: number
  warningThreshold: number
  isWarning: boolean
  isExceeded: boolean
  month: string
}

// 에이전트 상태
export interface AgentState {
  name: AgentName
  status: AgentStatus
  output: string | null
  startedAt: string | null
  completedAt: string | null
  error: string | null
}

// 파이프라인 전체 상태
export interface PipelineState {
  currentStep: number
  qaIteration: number
  agents: Record<AgentName, AgentState>
}

// 세션
export interface Session {
  id: string
  instruction: string
  refinedInstruction: string | null
  status: SessionStatus
  pipeline: PipelineState
  files: FileOutput[]
  clarificationQuestions: string[] | null
  createdAt: string
  updatedAt: string
}

// API 공통 응답
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// generate API 응답 데이터
export interface GenerateResponseData {
  sessionId: string
  status: SessionStatus
  needsClarification: boolean
  needsApproval: boolean
  clarificationQuestions?: string[]
  uiDesign?: string
  pipeline?: PipelineState
  files?: FileOutput[]
  tokenUsage?: TokenUsage
}

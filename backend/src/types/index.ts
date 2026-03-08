// 에이전트 상태 타입
export type AgentStatus = 'idle' | 'working' | 'reviewing' | 'done' | 'error'

// 세션 상태 타입
export type SessionStatus = 'pending' | 'clarifying' | 'running' | 'completed' | 'failed'

// 에이전트 이름 타입
export type AgentName = 'manager' | 'planner' | 'designer' | 'developer' | 'qa'

// 파일 출력 (개발자 에이전트가 생성하는 코드 파일)
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
  month: string // YYYY-MM 형식
}

// 에이전트 상태
export interface AgentState {
  name: AgentName
  status: AgentStatus
  output: string | null  // 마크다운 또는 JSON 문자열
  startedAt: string | null
  completedAt: string | null
  error: string | null
}

// 파이프라인 전체 상태
export interface PipelineState {
  currentStep: number  // 0~4 (매니저=0, 기획자=1, 디자이너=2, 개발자=3, QA=4)
  qaIteration: number  // QA 반복 횟수 (최대 3)
  agents: Record<AgentName, AgentState>
}

// 세션
export interface Session {
  id: string
  instruction: string            // 사용자 원본 지시
  refinedInstruction: string | null  // 매니저가 정제한 지시
  status: SessionStatus
  pipeline: PipelineState
  files: FileOutput[]            // 최종 생성된 파일들
  clarificationQuestions: string[] | null  // 매니저가 반환한 추가 질문
  createdAt: string
  updatedAt: string
}

// 매니저 에이전트 결과
export interface ManagerResult {
  needsClarification: boolean
  clarityScore: number           // 0.0 ~ 1.0
  questions: string[]            // needsClarification=true 일 때
  refinedInstruction: string     // needsClarification=false 일 때
}

// QA 에이전트 결과
export interface QAResult {
  passed: boolean
  feedback: string               // 실패 시 구체적 피드백
  issues: string[]               // 발견된 이슈 목록
}

// API 요청 타입
export interface GenerateRequest {
  instruction: string
  sessionId?: string             // 재시도 시 기존 세션 ID
  clarification?: string         // 추가 질문에 대한 사용자 답변
}

// API 응답 타입
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
  clarificationQuestions?: string[]
  pipeline?: PipelineState
  files?: FileOutput[]
  tokenUsage?: TokenUsage
}

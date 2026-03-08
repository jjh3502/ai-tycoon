import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import type { Session, AgentName, AgentState, PipelineState } from '../types/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SESSIONS_DIR = join(__dirname, '../../data/sessions')

// 세션 디렉토리 초기화
function ensureSessionsDir(): void {
  if (!existsSync(SESSIONS_DIR)) {
    mkdirSync(SESSIONS_DIR, { recursive: true })
  }
}

// 세션 파일 경로
function sessionFilePath(id: string): string {
  return join(SESSIONS_DIR, `${id}.json`)
}

// 초기 에이전트 상태 생성
function createInitialAgentState(name: AgentName): AgentState {
  return {
    name,
    status: 'idle',
    output: null,
    startedAt: null,
    completedAt: null,
    error: null,
  }
}

// 초기 파이프라인 상태 생성
function createInitialPipeline(): PipelineState {
  return {
    currentStep: 0,
    qaIteration: 0,
    agents: {
      manager: createInitialAgentState('manager'),
      planner: createInitialAgentState('planner'),
      designer: createInitialAgentState('designer'),
      developer: createInitialAgentState('developer'),
      qa: createInitialAgentState('qa'),
    },
  }
}

// 새 세션 생성
export function createSession(instruction: string): Session {
  ensureSessionsDir()

  const now = new Date().toISOString()
  const session: Session = {
    id: uuidv4(),
    instruction,
    refinedInstruction: null,
    status: 'pending',
    pipeline: createInitialPipeline(),
    files: [],
    clarificationQuestions: null,
    createdAt: now,
    updatedAt: now,
  }

  writeFileSync(sessionFilePath(session.id), JSON.stringify(session, null, 2), 'utf-8')
  return session
}

// 세션 조회
export function getSession(id: string): Session | null {
  const filePath = sessionFilePath(id)
  if (!existsSync(filePath)) {
    return null
  }

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

// 세션 업데이트
export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const session = getSession(id)
  if (!session) {
    return null
  }

  const updated: Session = {
    ...session,
    ...updates,
    id,                               // id는 변경 불가
    updatedAt: new Date().toISOString(),
  }

  writeFileSync(sessionFilePath(id), JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

// 전체 세션 목록 (최신순)
export function listSessions(): Session[] {
  ensureSessionsDir()

  const files = readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json'))

  const sessions = files.reduce<Session[]>((acc, file) => {
    try {
      const raw = readFileSync(join(SESSIONS_DIR, file), 'utf-8')
      const session = JSON.parse(raw) as Session
      return [...acc, session]
    } catch {
      return acc
    }
  }, [])

  // 최신순 정렬
  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

// 세션 삭제
export function deleteSession(id: string): boolean {
  const filePath = sessionFilePath(id)
  if (!existsSync(filePath)) {
    return false
  }
  unlinkSync(filePath)
  return true
}

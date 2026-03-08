import type {
  ApiResponse,
  GenerateResponseData,
  Session,
  TokenUsage,
} from '../types/index.js'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// 공통 fetch 헬퍼
async function fetchApi<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await response.json() as ApiResponse<T>

  if (!response.ok && !data.error) {
    throw new Error(`HTTP ${response.status}: 서버 오류가 발생했습니다`)
  }

  return data
}

// 앱 생성 요청
export async function generateApp(params: {
  instruction: string
  sessionId?: string
  clarification?: string
  approved?: boolean
}): Promise<ApiResponse<GenerateResponseData>> {
  return fetchApi<GenerateResponseData>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// 세션 목록 조회
export async function getSessions(): Promise<ApiResponse<Session[]>> {
  return fetchApi<Session[]>('/api/sessions')
}

// 세션 상세 조회
export async function getSession(id: string): Promise<ApiResponse<Session>> {
  return fetchApi<Session>(`/api/sessions/${id}`)
}

// 세션 삭제
export async function deleteSession(id: string): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/api/sessions/${id}`, { method: 'DELETE' })
}

// 토큰 사용량 조회
export async function getTokenUsage(): Promise<ApiResponse<TokenUsage>> {
  return fetchApi<TokenUsage>('/api/tokens')
}

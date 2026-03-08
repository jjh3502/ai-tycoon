import { create } from 'zustand'
import { generateApp } from '../lib/api.js'
import type { SessionStatus, PipelineState, FileOutput } from '../types/index.js'

interface WorkflowState {
  // 상태
  status: SessionStatus | 'idle'
  sessionId: string | null
  pipeline: PipelineState | null
  files: FileOutput[]
  clarificationQuestions: string[]
  uiDesign: string | null
  error: string | null
  isLoading: boolean

  // 액션
  run: (instruction: string) => Promise<void>
  submitClarification: (clarification: string) => Promise<void>
  approveDesign: () => Promise<void>
  reset: () => void
}

const initialState = {
  status: 'idle' as const,
  sessionId: null,
  pipeline: null,
  files: [],
  clarificationQuestions: [],
  uiDesign: null,
  error: null,
  isLoading: false,
}

export const useWorkflow = create<WorkflowState>((set, get) => ({
  ...initialState,

  // 새 지시 실행
  run: async (instruction: string) => {
    set({ ...initialState, isLoading: true, status: 'running' })

    try {
      const result = await generateApp({ instruction })

      if (!result.success || !result.data) {
        set({ isLoading: false, status: 'failed', error: result.error ?? '알 수 없는 오류' })
        return
      }

      const data = result.data
      set({
        isLoading: false,
        sessionId: data.sessionId,
        status: data.status,
        pipeline: data.pipeline ?? null,
        files: data.files ?? [],
        clarificationQuestions: data.clarificationQuestions ?? [],
        uiDesign: data.uiDesign ?? null,
        error: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        status: 'failed',
        error: err instanceof Error ? err.message : '네트워크 오류가 발생했습니다',
      })
    }
  },

  // 추가 질문 답변 후 재실행
  submitClarification: async (clarification: string) => {
    const { sessionId } = get()
    if (!sessionId) return

    set({ isLoading: true, status: 'running', clarificationQuestions: [] })

    try {
      const result = await generateApp({ instruction: '', sessionId, clarification })

      if (!result.success || !result.data) {
        set({ isLoading: false, status: 'failed', error: result.error ?? '알 수 없는 오류' })
        return
      }

      const data = result.data
      set({
        isLoading: false,
        status: data.status,
        pipeline: data.pipeline ?? null,
        files: data.files ?? [],
        clarificationQuestions: data.clarificationQuestions ?? [],
        uiDesign: data.uiDesign ?? null,
        error: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        status: 'failed',
        error: err instanceof Error ? err.message : '네트워크 오류가 발생했습니다',
      })
    }
  },

  // UI 설계 승인 후 개발 진행
  approveDesign: async () => {
    const { sessionId } = get()
    if (!sessionId) return

    set({ isLoading: true, status: 'running', uiDesign: null })

    try {
      const result = await generateApp({ instruction: '', sessionId, approved: true })

      if (!result.success || !result.data) {
        set({ isLoading: false, status: 'failed', error: result.error ?? '알 수 없는 오류' })
        return
      }

      const data = result.data
      set({
        isLoading: false,
        status: data.status,
        pipeline: data.pipeline ?? null,
        files: data.files ?? [],
        error: null,
      })
    } catch (err) {
      set({
        isLoading: false,
        status: 'failed',
        error: err instanceof Error ? err.message : '네트워크 오류가 발생했습니다',
      })
    }
  },

  // 초기화
  reset: () => set(initialState),
}))

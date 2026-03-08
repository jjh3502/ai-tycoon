import { create } from 'zustand'
import { getSessions, getSession, deleteSession as deleteSessionApi } from '../lib/api.js'
import type { Session } from '../types/index.js'

interface SessionsState {
  // 상태
  sessions: Session[]
  selectedSession: Session | null
  isLoading: boolean
  error: string | null

  // 액션
  fetchSessions: () => Promise<void>
  selectSession: (id: string) => Promise<void>
  removeSession: (id: string) => Promise<boolean>
  clearSelection: () => void
}

export const useSessions = create<SessionsState>((set) => ({
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,

  // 세션 목록 조회
  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await getSessions()
      if (result.success && result.data) {
        set({ sessions: result.data, isLoading: false })
      } else {
        set({ isLoading: false, error: result.error ?? '세션 목록을 불러올 수 없습니다' })
      }
    } catch {
      set({ isLoading: false, error: '네트워크 오류가 발생했습니다' })
    }
  },

  // 세션 상세 조회 및 선택
  selectSession: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await getSession(id)
      if (result.success && result.data) {
        set({ selectedSession: result.data, isLoading: false })
      } else {
        set({ isLoading: false, error: result.error ?? '세션을 찾을 수 없습니다' })
      }
    } catch {
      set({ isLoading: false, error: '네트워크 오류가 발생했습니다' })
    }
  },

  // 세션 삭제 (성공 여부 반환)
  removeSession: async (id: string) => {
    try {
      const result = await deleteSessionApi(id)
      if (result.success) {
        // 목록에서 즉시 제거, 선택된 세션이면 선택 해제
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          selectedSession: state.selectedSession?.id === id ? null : state.selectedSession,
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  // 선택 초기화
  clearSelection: () => set({ selectedSession: null }),
}))

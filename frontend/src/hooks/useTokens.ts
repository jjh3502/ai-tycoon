import { create } from 'zustand'
import { getTokenUsage } from '../lib/api.js'
import type { TokenUsage } from '../types/index.js'

interface TokensState {
  usage: TokenUsage | null
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useTokens = create<TokensState>((set) => ({
  usage: null,
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await getTokenUsage()
      if (result.success && result.data) {
        set({ usage: result.data, isLoading: false })
      } else {
        set({ isLoading: false, error: result.error ?? '토큰 정보를 불러올 수 없습니다' })
      }
    } catch {
      set({ isLoading: false, error: '네트워크 오류가 발생했습니다' })
    }
  },
}))

// 30초마다 자동 갱신
let intervalId: ReturnType<typeof setInterval> | null = null

export function startTokenPolling(fetch: () => Promise<void>) {
  if (intervalId) return
  void fetch()
  intervalId = setInterval(() => void fetch(), 30_000)
}

export function stopTokenPolling() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

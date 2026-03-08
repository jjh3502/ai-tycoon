import { Router } from 'express'
import { getSession, listSessions, deleteSession } from '../lib/sessionStore.js'
import type { ApiResponse, Session } from '../types/index.js'

export const sessionsRouter = Router()

// GET /api/sessions — 전체 세션 목록 (최신순)
sessionsRouter.get('/', (_req, res) => {
  const sessions = listSessions()
  const response: ApiResponse<Session[]> = {
    success: true,
    data: sessions,
  }
  res.json(response)
})

// GET /api/sessions/:id — 세션 상세
sessionsRouter.get('/:id', (req, res) => {
  const session = getSession(req.params.id)

  if (!session) {
    const response: ApiResponse<never> = {
      success: false,
      error: '세션을 찾을 수 없습니다',
    }
    res.status(404).json(response)
    return
  }

  const response: ApiResponse<Session> = {
    success: true,
    data: session,
  }
  res.json(response)
})

// DELETE /api/sessions/:id — 세션 삭제
sessionsRouter.delete('/:id', (req, res) => {
  const deleted = deleteSession(req.params.id)

  if (!deleted) {
    const response: ApiResponse<never> = {
      success: false,
      error: '세션을 찾을 수 없습니다',
    }
    res.status(404).json(response)
    return
  }

  const response: ApiResponse<null> = {
    success: true,
    data: null,
  }
  res.json(response)
})

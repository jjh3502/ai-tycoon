import { Router } from 'express'
import { getUsage } from '../lib/tokenCounter.js'
import type { ApiResponse, TokenUsage } from '../types/index.js'

export const tokensRouter = Router()

// GET /api/tokens — 현재 토큰 사용량
tokensRouter.get('/', (_req, res) => {
  const usage = getUsage()
  const response: ApiResponse<TokenUsage> = {
    success: true,
    data: usage,
  }
  res.json(response)
})

import rateLimit from 'express-rate-limit'
import type { ApiResponse } from '../types/index.js'

// API 요청 제한: 분당 10회
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const response: ApiResponse<never> = {
      success: false,
      error: '요청 한도를 초과했습니다. 1분 후 다시 시도해주세요.',
    }
    res.status(429).json(response)
  },
})

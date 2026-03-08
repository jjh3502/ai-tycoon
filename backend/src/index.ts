import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// CORS 설정 (프론트엔드 개발 서버 허용)
app.use(
  cors({
    origin:
      env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://127.0.0.1:5173']
        : [],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
)

// JSON 바디 파서
app.use(express.json({ limit: '10mb' }))

// Rate limiter (API 라우트에만 적용)
app.use('/api', rateLimiter)

// 헬스체크
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 라우트 (Phase 4에서 추가 예정)
// app.use('/api/generate', generateRouter)
// app.use('/api/sessions', sessionsRouter)
// app.use('/api/tokens', tokensRouter)

// 글로벌 에러 핸들러 (반드시 마지막에 등록)
app.use(errorHandler)

// 서버 기동
app.listen(env.PORT, () => {
  console.log(`✅ AI 타이쿤 백엔드 서버 기동`)
  console.log(`   포트: ${env.PORT}`)
  console.log(`   환경: ${env.NODE_ENV}`)
  console.log(`   월 토큰 한도: ${env.MONTHLY_TOKEN_LIMIT.toLocaleString()}`)
})

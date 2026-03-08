import { Router } from 'express'
import { z } from 'zod'
import { createSession, getSession } from '../lib/sessionStore.js'
import { runWorkflow } from '../lib/workflow.js'
import { isExceeded, getUsage } from '../lib/tokenCounter.js'
import type { ApiResponse, GenerateResponseData } from '../types/index.js'

export const generateRouter = Router()

// 입력 검증 스키마
const generateSchema = z.object({
  instruction: z
    .string()
    .min(1, '지시사항을 입력해주세요')
    .max(2000, '지시사항은 최대 2000자까지 입력 가능합니다'),
  sessionId: z.string().uuid().optional(),
  clarification: z.string().max(2000).optional(),
})

// POST /api/generate
generateRouter.post('/', async (req, res, next) => {
  try {
    // 입력 검증
    const body = generateSchema.parse(req.body)

    // 토큰 한도 초과 시 차단
    if (isExceeded()) {
      const usage = getUsage()
      const response: ApiResponse<never> = {
        success: false,
        error: `월 토큰 한도(${usage.limit.toLocaleString()})를 초과했습니다. 다음 달에 다시 시도해주세요.`,
      }
      res.status(403).json(response)
      return
    }

    // 세션 조회 또는 신규 생성
    let session = body.sessionId ? getSession(body.sessionId) : null

    if (!session) {
      session = createSession(body.instruction)
    }

    // 파이프라인 비동기 실행
    const updatedSession = await runWorkflow(session, body.clarification)
    const tokenUsage = getUsage()

    // 추가 질문 필요 여부
    if (updatedSession.status === 'clarifying') {
      const response: ApiResponse<GenerateResponseData> = {
        success: true,
        data: {
          sessionId: updatedSession.id,
          status: 'clarifying',
          needsClarification: true,
          clarificationQuestions: updatedSession.clarificationQuestions ?? [],
          tokenUsage,
        },
      }
      res.status(200).json(response)
      return
    }

    // 완료 또는 실패
    const response: ApiResponse<GenerateResponseData> = {
      success: updatedSession.status === 'completed',
      data: {
        sessionId: updatedSession.id,
        status: updatedSession.status,
        needsClarification: false,
        pipeline: updatedSession.pipeline,
        files: updatedSession.files,
        tokenUsage,
      },
    }
    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
})

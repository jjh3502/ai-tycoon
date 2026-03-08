import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import type { ApiResponse } from '../types/index.js'

// 글로벌 에러 핸들러 미들웨어
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Zod 검증 오류
  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    const response: ApiResponse<never> = {
      success: false,
      error: `입력값 검증 실패: ${messages.join(', ')}`,
    }
    res.status(400).json(response)
    return
  }

  // 일반 에러
  if (err instanceof Error) {
    console.error('서버 에러:', err.message)
    // API 키 등 민감 정보가 에러 메시지에 포함되지 않도록 필터링
    const safeMessage = err.message.replace(/sk-ant-[a-zA-Z0-9-]+/g, '[REDACTED]')
    const response: ApiResponse<never> = {
      success: false,
      error: safeMessage,
    }
    res.status(500).json(response)
    return
  }

  // 알 수 없는 에러
  console.error('알 수 없는 서버 에러:', err)
  const response: ApiResponse<never> = {
    success: false,
    error: '서버 내부 오류가 발생했습니다',
  }
  res.status(500).json(response)
}

import { z } from 'zod'
import { config } from 'dotenv'

// .env 파일 로드
config()

// 환경변수 스키마 정의
const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY가 설정되지 않았습니다'),
  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(65535)),
  MONTHLY_TOKEN_LIMIT: z
    .string()
    .default('50000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  TOKEN_WARNING_THRESHOLD: z
    .string()
    .default('0.8')
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0).max(1)),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// 환경변수 파싱 — 실패 시 서버 기동 불가
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ 환경변수 설정 오류:')
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const env = parsed.data

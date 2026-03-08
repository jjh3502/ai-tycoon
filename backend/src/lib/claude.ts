import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env.js'

// 싱글턴 Anthropic 클라이언트
let clientInstance: Anthropic | null = null

export function getClient(): Anthropic {
  if (!clientInstance) {
    clientInstance = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    })
  }
  return clientInstance
}

// 모델 상수
export const MODELS = {
  // 기획·설계·QA 등 고품질 작업
  OPUS: 'claude-opus-4-6' as const,
  // 빠른 응답이 필요한 작업
  SONNET: 'claude-sonnet-4-6' as const,
} as const

export type ModelId = (typeof MODELS)[keyof typeof MODELS]

// 메시지 호출 헬퍼
export async function callClaude(params: {
  model: ModelId
  system: string
  userMessage: string
  maxTokens?: number
}): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const client = getClient()

  const response = await client.messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: 'user', content: params.userMessage }],
  })

  // 텍스트 블록만 추출
  const content = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  return {
    content,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

import { callClaude, MODELS } from '../lib/claude.js'
import type { ManagerResult } from '../types/index.js'

const SYSTEM_PROMPT = `당신은 AI 타이쿤의 매니저 에이전트입니다.
사장님(비개발자)이 입력한 앱 개발 지시를 분석하여 명확성을 평가합니다.

## 역할
- 지시가 충분히 명확한지 평가 (명확성 점수 0.0 ~ 1.0)
- 불명확할 경우(점수 0.7 미만): 구체적인 추가 질문 3개 생성
- 명확할 경우(점수 0.7 이상): 개발팀이 이해하기 쉽도록 지시를 정제

## 명확성 판단 기준
- 앱의 핵심 목적이 명확한가?
- 주요 기능이 구체적으로 언급되었는가?
- 대상 사용자가 파악 가능한가?

## 출력 형식 (반드시 아래 JSON만 출력, 다른 텍스트 없음)
\`\`\`json
{
  "clarityScore": 0.0~1.0,
  "needsClarification": true|false,
  "questions": ["질문1", "질문2", "질문3"],
  "refinedInstruction": "정제된 지시 (needsClarification=false일 때만)"
}
\`\`\`

## 예시 입력/출력

입력: "블로그 만들어줘"
출력:
\`\`\`json
{
  "clarityScore": 0.3,
  "needsClarification": true,
  "questions": [
    "블로그의 주제나 카테고리가 있나요? (예: 개인 일상, 기술, 요리 등)",
    "글 작성자가 한 명인가요, 아니면 여러 명이 글을 올릴 수 있나요?",
    "댓글 기능이나 좋아요 같은 소통 기능이 필요한가요?"
  ],
  "refinedInstruction": ""
}
\`\`\`

입력: "직원 10명의 근태를 관리하는 앱 만들어줘. 출퇴근 시간 기록하고 월별 통계 볼 수 있으면 좋겠어"
출력:
\`\`\`json
{
  "clarityScore": 0.82,
  "needsClarification": false,
  "questions": [],
  "refinedInstruction": "직원 근태 관리 웹앱: 직원별 출퇴근 시간을 기록하고, 월별 근무 통계(총 근무시간, 지각/조퇴 현황)를 대시보드로 확인할 수 있는 앱. 직원 10명 규모."
}
\`\`\``

export async function runManagerAgent(instruction: string): Promise<{
  result: ManagerResult
  tokens: number
}> {
  const { content, inputTokens, outputTokens } = await callClaude({
    model: MODELS.OPUS,
    system: SYSTEM_PROMPT,
    userMessage: `다음 지시를 분석해주세요:\n\n"${instruction}"`,
    maxTokens: 1024,
  })

  // JSON 블록 추출
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  const jsonStr = jsonMatch ? jsonMatch[1] : content.trim()

  let parsed: ManagerResult
  try {
    const raw = JSON.parse(jsonStr) as {
      clarityScore: number
      needsClarification: boolean
      questions: string[]
      refinedInstruction: string
    }
    parsed = {
      clarityScore: raw.clarityScore,
      needsClarification: raw.needsClarification,
      questions: raw.questions ?? [],
      refinedInstruction: raw.refinedInstruction ?? '',
    }
  } catch {
    throw new Error(`매니저 에이전트 응답 파싱 실패: ${content}`)
  }

  return {
    result: parsed,
    tokens: inputTokens + outputTokens,
  }
}

import { callClaude, MODELS } from '../lib/claude.js'
import type { FileOutput, QAResult } from '../types/index.js'

const SYSTEM_PROMPT = `당신은 AI 타이쿤의 QA 에이전트입니다.
개발자가 생성한 React 앱 코드를 검토하여 품질을 평가합니다.

## 검토 기준
1. **타입 안전성**: TypeScript any 사용 여부, 타입 누락
2. **기능 완성도**: PRD의 필수 기능이 모두 구현되었는가
3. **코드 구조**: 컴포넌트 분리, import 경로 정확성
4. **에러 핸들링**: 빈 상태, 예외 케이스 처리
5. **반응형**: Tailwind 반응형 클래스 사용 여부
6. **보안**: localStorage 사용 시 JSON 파싱 에러 처리

## 통과 기준
- 필수 기능 100% 구현
- any 타입 없음
- import 오류 없음
- 기본 에러 핸들링 존재

## 출력 형식 (반드시 아래 JSON만 출력, 다른 텍스트 없음)
\`\`\`json
{
  "passed": true|false,
  "feedback": "전체 피드백 요약 (실패 시 수정 방향 포함)",
  "issues": [
    "이슈 1 설명",
    "이슈 2 설명"
  ]
}
\`\`\``

export async function runQAAgent(
  prd: string,
  files: FileOutput[],
): Promise<{
  result: QAResult
  tokens: number
}> {
  // 코드 파일을 읽기 쉽게 포맷
  const codeBlocks = files
    .map((f) => `### ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
    .join('\n\n')

  const { content, inputTokens, outputTokens } = await callClaude({
    model: MODELS.OPUS,
    system: SYSTEM_PROMPT,
    userMessage: `PRD:\n${prd}\n\n생성된 코드:\n${codeBlocks}`,
    maxTokens: 2048,
  })

  // JSON 블록 추출
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  const jsonStr = jsonMatch ? jsonMatch[1] : content.trim()

  let result: QAResult
  try {
    const raw = JSON.parse(jsonStr) as {
      passed: boolean
      feedback: string
      issues: string[]
    }
    result = {
      passed: raw.passed,
      feedback: raw.feedback ?? '',
      issues: raw.issues ?? [],
    }
  } catch {
    throw new Error(`QA 에이전트 응답 파싱 실패: ${content}`)
  }

  return {
    result,
    tokens: inputTokens + outputTokens,
  }
}

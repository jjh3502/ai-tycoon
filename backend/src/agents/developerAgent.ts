import { callClaude, MODELS } from '../lib/claude.js'
import type { FileOutput } from '../types/index.js'

const SYSTEM_PROMPT = `당신은 AI 타이쿤의 개발자 에이전트입니다.
PRD와 UI 설계를 바탕으로 실제 동작하는 React 앱 코드를 생성합니다.

## 기술 스택 (고정, 변경 불가)
- React 18 + TypeScript (strict)
- Tailwind CSS 3
- localStorage (데이터 영속성)
- 외부 라이브러리 없음 (lucide-react 아이콘은 사용 가능)

## 코드 품질 기준
- any 타입 사용 금지
- 컴포넌트당 50줄 이하 권장 (최대 100줄)
- 에러 핸들링 필수
- 반응형 디자인 (모바일 우선)
- 한국어 주석

## 출력 형식 (반드시 아래 JSON 배열만 출력, 다른 텍스트 없음)
\`\`\`json
[
  {
    "path": "src/App.tsx",
    "language": "typescript",
    "content": "실제 코드 내용"
  },
  {
    "path": "src/types/index.ts",
    "language": "typescript",
    "content": "실제 코드 내용"
  }
]
\`\`\`

## 파일 구성 원칙
- App.tsx: 메인 레이아웃 및 라우팅
- types/index.ts: 타입 정의
- components/: 재사용 컴포넌트
- hooks/: 커스텀 훅 (상태 로직)
- utils/: 유틸리티 함수

## 중요
- 반드시 완전히 동작하는 코드를 생성하세요
- import 경로는 상대 경로 사용
- Tailwind 클래스만 사용 (인라인 스타일 금지)`

export async function runDeveloperAgent(
  prd: string,
  uiDesign: string,
  qaFeedback?: string,
): Promise<{
  files: FileOutput[]
  tokens: number
}> {
  // QA 피드백이 있을 경우 수정 요청 포함
  const userMessage = qaFeedback
    ? `PRD:\n${prd}\n\nUI 설계:\n${uiDesign}\n\nQA 피드백 (반드시 반영):\n${qaFeedback}\n\n위 피드백을 모두 반영하여 전체 코드를 다시 생성해주세요.`
    : `PRD:\n${prd}\n\nUI 설계:\n${uiDesign}\n\n위 내용을 바탕으로 완전히 동작하는 React 앱 코드를 생성해주세요.`

  const { content, inputTokens, outputTokens } = await callClaude({
    model: MODELS.OPUS,
    system: SYSTEM_PROMPT,
    userMessage,
    maxTokens: 8192,
  })

  // JSON 블록 추출
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  const jsonStr = jsonMatch ? jsonMatch[1] : content.trim()

  let files: FileOutput[]
  try {
    const raw = JSON.parse(jsonStr) as Array<{
      path: string
      language: string
      content: string
    }>

    if (!Array.isArray(raw)) {
      throw new Error('파일 목록이 배열이 아닙니다')
    }

    files = raw.map((f) => ({
      path: f.path,
      language: f.language ?? 'typescript',
      content: f.content,
    }))
  } catch {
    throw new Error(`개발자 에이전트 응답 파싱 실패: ${content.slice(0, 200)}`)
  }

  return {
    files,
    tokens: inputTokens + outputTokens,
  }
}

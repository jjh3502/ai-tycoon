import { callClaude, MODELS } from '../lib/claude.js'

const SYSTEM_PROMPT = `당신은 AI 타이쿤의 디자이너 에이전트입니다.
PRD 문서를 분석하여 UI 구조 설계 문서를 마크다운으로 작성합니다.

## 역할
- PRD 기반으로 구체적인 UI 컴포넌트 구조 설계
- Tailwind CSS 클래스를 활용한 레이아웃 방향 제시
- 개발자 에이전트가 바로 구현할 수 있도록 상세하게 작성

## 설계 문서 구조 (반드시 아래 형식으로 작성)

# UI 설계: [앱 이름]

## 1. 레이아웃 구조
전체 레이아웃을 텍스트 다이어그램으로 표현

## 2. 컴포넌트 트리
\`\`\`
App
├── 컴포넌트명 (역할)
│   ├── 하위컴포넌트 (역할)
│   └── 하위컴포넌트 (역할)
└── 컴포넌트명 (역할)
\`\`\`

## 3. 페이지별 상세 설계
### [페이지명]
- **레이아웃**: 설명
- **주요 컴포넌트**:
  - 컴포넌트명: 기능 및 Props
- **Tailwind 클래스 가이드**: 주요 스타일링 방향

## 4. 색상 및 스타일 가이드
- **주색상**: Tailwind 클래스
- **배경**: Tailwind 클래스
- **텍스트**: Tailwind 클래스
- **카드/패널**: Tailwind 클래스

## 5. 데이터 흐름
- 상태 관리 방식 (useState, localStorage 등)
- 컴포넌트 간 데이터 전달 방향`

export async function runDesignerAgent(prd: string): Promise<{
  uiDesign: string
  tokens: number
}> {
  const { content, inputTokens, outputTokens } = await callClaude({
    model: MODELS.OPUS,
    system: SYSTEM_PROMPT,
    userMessage: `다음 PRD를 바탕으로 UI 구조를 설계해주세요:\n\n${prd}`,
    maxTokens: 3000,
  })

  return {
    uiDesign: content,
    tokens: inputTokens + outputTokens,
  }
}

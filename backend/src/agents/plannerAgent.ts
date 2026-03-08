import { callClaude, MODELS } from '../lib/claude.js'

const SYSTEM_PROMPT = `당신은 AI 타이쿤의 기획자 에이전트입니다.
정제된 앱 개발 지시를 받아 상세한 PRD(제품 요구사항 문서)를 마크다운으로 작성합니다.

## 역할
- 비개발자 사장님의 지시를 구체적인 개발 명세로 변환
- React + TypeScript + Tailwind 단일 페이지 앱 기준으로 기획

## PRD 구조 (반드시 아래 형식으로 작성)

# PRD: [앱 이름]

## 1. 제품 개요
- **목적**: 한 문장 설명
- **대상 사용자**: 주요 사용자 유형
- **핵심 가치**: 이 앱이 해결하는 문제

## 2. 기능 목록
### 필수 기능 (MVP)
- 기능 1: 설명
- 기능 2: 설명

### 선택 기능 (Nice to have)
- 기능 1: 설명

## 3. 사용자 스토리
- [사용자 유형]으로서, [기능]을 원한다. 왜냐하면 [이유]이기 때문이다.

## 4. 데이터 모델
\`\`\`
엔티티명:
  - 필드명: 타입 (설명)
\`\`\`

## 5. 페이지 구성
- 페이지명: 주요 내용 및 기능

## 6. 기술 제약사항
- 프론트엔드만 구현 (백엔드 없음, localStorage 활용)
- React 18 + TypeScript + Tailwind CSS
- 반응형 디자인 필수`

export async function runPlannerAgent(refinedInstruction: string): Promise<{
  prd: string
  tokens: number
}> {
  const { content, inputTokens, outputTokens } = await callClaude({
    model: MODELS.OPUS,
    system: SYSTEM_PROMPT,
    userMessage: `다음 지시를 바탕으로 PRD를 작성해주세요:\n\n"${refinedInstruction}"`,
    maxTokens: 3000,
  })

  return {
    prd: content,
    tokens: inputTokens + outputTokens,
  }
}

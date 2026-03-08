# AI 타이쿤 (AI Tycoon) — 제품 요구사항 문서 (PRD)

- **버전**: 1.0.0
- **작성일**: 2026-03-08
- **상태**: 초안

---

## 1. 제품 개요

### 1.1 한 줄 요약
비개발자 사장님이 자연어로 "OO 만들어줘"라고 입력하면, 5개 AI 에이전트가 자동으로 기획 → 설계 → 개발 → 검토 파이프라인을 실행하여 실제 동작하는 웹앱 코드를 생성해주는 플랫폼.

### 1.2 배경 및 문제
- 비개발자는 아이디어가 있어도 구현 비용(시간·돈)이 너무 높음
- 외주 개발은 커뮤니케이션 비용 + 긴 납기가 문제
- AI 코딩 도구는 개발자 전용 → 비개발자가 직접 사용하기 어려움

### 1.3 해결책
자연어 입력 하나로 전체 개발 파이프라인을 자동 실행하는 AI 에이전트 오케스트레이터.

---

## 2. 목표 및 성공 지표

### 2.1 목표
| 목표 | 세부 내용 |
|------|-----------|
| 접근성 | 비개발자가 5분 이내에 웹앱 코드를 생성할 수 있어야 함 |
| 품질 | QA 에이전트 검토를 통해 기본 동작 가능한 코드 보장 |
| 비용 | 월 토큰 한도(50,000) 내에서 운영 가능 |

### 2.2 성공 지표 (KPI)
- 파이프라인 완료율: 90% 이상 (에러 없이 최종 결과 도달)
- 평균 완료 시간: 3분 이내
- QA 재시도 없이 통과율: 60% 이상
- 월 토큰 초과 빈도: 0회

---

## 3. 사용자

### 3.1 주요 사용자
**비개발자 사장님**
- 특징: 개발 지식 없음, 아이디어는 있음, 빠른 결과를 원함
- 니즈: "말만 하면 코드가 나오는" 경험
- 불편함: 기술 용어, 복잡한 UI, 긴 대기 시간

### 3.2 사용자 스토리

| ID | 스토리 | 우선순위 |
|----|--------|----------|
| US-01 | 나는 사장님으로서, "고객 주문 관리 앱 만들어줘"라고 입력하면 실제 동작하는 코드를 받고 싶다 | 필수 |
| US-02 | 나는 사장님으로서, 지시가 불명확할 때 AI가 추가 질문을 해줘서 의도를 명확히 하고 싶다 | 필수 |
| US-03 | 나는 사장님으로서, 각 에이전트가 무엇을 하고 있는지 실시간으로 보고 싶다 | 필수 |
| US-04 | 나는 사장님으로서, 이전에 만든 앱 목록을 다시 볼 수 있으면 좋겠다 | 중요 |
| US-05 | 나는 사장님으로서, 토큰(비용)이 얼마나 사용됐는지 알고 싶다 | 중요 |
| US-06 | 나는 사장님으로서, 에이전트가 생성한 결과물을 상세히 확인하고 싶다 | 중요 |

---

## 4. 기능 요구사항

### 4.1 에이전트 파이프라인

```
사장님 입력
    ↓
[1] 매니저 에이전트
    ├─ 명확함 → [2] 기획자로 전달
    └─ 불명확 → 추가 질문 반환 (사장님 재입력 대기)
    ↓
[2] 기획자 에이전트 → PRD 마크다운 생성
    ↓
[3] 디자이너 에이전트 → UI 구조 설계 문서 생성
    ↓
[4] 개발자 에이전트 → 프론트엔드 + 백엔드 코드 생성
    ↓
[5] QA 에이전트 → 코드 검토
    ├─ 통과 → 결과 표시 (완료)
    └─ 실패 → [4] 개발자에게 피드백 (최대 3회 반복)
               3회 초과 → 현재 상태로 강제 완료
```

### 4.2 에이전트별 상세 명세

#### [1] 매니저 에이전트 (`managerAgent.ts`)
- **역할**: 사장님 지시 수신 및 명확성 판단
- **입력**: 사장님의 자연어 지시 (최대 2,000자)
- **처리**:
  - 명확성 점수 산출 (0.0 ~ 1.0)
  - 0.7 미만 → 추가 질문 목록 생성 (최대 3개)
  - 0.7 이상 → 정제된 지시를 다음 에이전트로 전달
- **출력**:
  - 명확한 경우: `{ type: 'proceed', refinedInstruction: string }`
  - 불명확한 경우: `{ type: 'question', questions: string[] }`

#### [2] 기획자 에이전트 (`plannerAgent.ts`)
- **역할**: PRD 마크다운 문서 생성
- **입력**: 매니저가 정제한 지시
- **출력**: PRD 마크다운 (제품 개요, 기능 목록, 사용자 스토리, 데이터 모델)

#### [3] 디자이너 에이전트 (`designerAgent.ts`)
- **역할**: UI 구조 설계 문서 생성
- **입력**: 기획자가 생성한 PRD
- **출력**: UI 설계 마크다운 (페이지 목록, 컴포넌트 구조, 데이터 플로우)

#### [4] 개발자 에이전트 (`developerAgent.ts`)
- **역할**: 실제 동작하는 코드 생성
- **입력**: PRD + UI 설계 (+ QA 피드백이 있을 경우 포함)
- **출력**: 파일명과 코드가 포함된 JSON 구조
  ```json
  {
    "files": [
      { "path": "src/App.tsx", "content": "..." },
      { "path": "src/components/...", "content": "..." }
    ]
  }
  ```
- **기술 스택 고정**: React + TypeScript + Tailwind CSS

#### [5] QA 에이전트 (`qaAgent.ts`)
- **역할**: 생성된 코드 품질 검토
- **입력**: 개발자가 생성한 코드
- **검토 항목**:
  - TypeScript 타입 오류 가능성
  - 컴포넌트 구조 적절성
  - 누락된 기능 여부
  - 보안 취약점 (XSS, 인젝션 등)
- **출력**:
  - 통과: `{ passed: true, summary: string }`
  - 실패: `{ passed: false, issues: string[], feedback: string }`
- **제한**: 최대 3회 루프. 초과 시 강제 완료.

### 4.3 세션 관리

- 각 파이프라인 실행은 고유 세션 ID로 관리
- 세션 데이터는 JSON 파일로 서버에 저장 (`sessionStore.ts`)
- 사용자는 이전 세션 목록을 조회하고 결과를 다시 볼 수 있음

### 4.4 토큰 관리

- 월 누적 토큰 사용량 추적
- 임계값(기본 80%) 도달 시 프론트엔드에 경고 배너 표시
- 월 한도(기본 50,000 토큰) 초과 시 새 파이프라인 실행 차단

---

## 5. API 명세

### 5.1 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/generate` | 파이프라인 실행 |
| GET | `/api/sessions` | 세션 목록 조회 |
| GET | `/api/sessions/:id` | 세션 상세 조회 |
| GET | `/api/tokens` | 토큰 사용량 조회 |

### 5.2 상세 명세

#### POST `/api/generate`
```typescript
// 요청
{
  instruction: string       // 사장님 지시 (1~2000자)
  sessionId?: string        // 재시도 시 기존 세션 ID
  clarification?: string    // 추가 질문에 대한 답변
}

// 응답 - 명확한 경우
{
  success: true
  sessionId: string
  status: 'completed'
  result: {
    prd: string             // 기획자 결과물
    design: string          // 디자이너 결과물
    files: FileOutput[]     // 개발자 생성 파일 목록
    qaReport: string        // QA 검토 결과
    qaAttempts: number      // QA 시도 횟수
  }
  tokensUsed: number
}

// 응답 - 불명확한 경우
{
  success: true
  sessionId: string
  status: 'needs_clarification'
  questions: string[]
}

// 응답 - 에러
{
  success: false
  error: string
  code: 'TOKEN_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'PIPELINE_ERROR'
}
```

#### GET `/api/sessions`
```typescript
// 응답
{
  success: true
  sessions: SessionSummary[]
}

// SessionSummary
{
  id: string
  instruction: string       // 원본 지시 (최대 100자 요약)
  status: 'completed' | 'needs_clarification' | 'error'
  createdAt: string         // ISO 8601
  tokensUsed: number
}
```

#### GET `/api/tokens`
```typescript
// 응답
{
  success: true
  usage: {
    used: number            // 이번 달 사용량
    limit: number           // 월 한도
    percentage: number      // 사용률 (0~100)
    isWarning: boolean      // 경고 임계값 초과 여부
    isExceeded: boolean     // 한도 초과 여부
  }
}
```

---

## 6. 데이터 모델

### 6.1 세션 (Session)

```typescript
interface Session {
  id: string                        // UUID
  instruction: string               // 원본 사장님 지시
  status: SessionStatus
  createdAt: string                 // ISO 8601
  updatedAt: string
  tokensUsed: number
  pipeline: PipelineState
}

type SessionStatus =
  | 'needs_clarification'           // 추가 질문 대기
  | 'running'                       // 파이프라인 실행 중
  | 'completed'                     // 완료
  | 'error'                         // 오류

interface PipelineState {
  manager: AgentState
  planner: AgentState
  designer: AgentState
  developer: AgentState
  qa: AgentState & { attempts: number }
}

interface AgentState {
  status: AgentStatus
  output: string | null             // 에이전트 결과물
  startedAt: string | null
  completedAt: string | null
}

type AgentStatus = 'idle' | 'working' | 'done' | 'error'
```

### 6.2 토큰 카운터 (TokenCounter)

```typescript
interface TokenUsage {
  month: string                     // YYYY-MM 형식
  used: number
  limit: number
  warningThreshold: number          // 0~1 비율
}
```

### 6.3 파일 출력 (FileOutput)

```typescript
interface FileOutput {
  path: string                      // 파일 경로 (예: src/App.tsx)
  content: string                   // 파일 내용
  language: string                  // 언어 (typescript, css 등)
}
```

---

## 7. UI/UX 요구사항

### 7.1 페이지 구조

```
App
├── 상단 헤더
│   ├── 로고 (AI Tycoon)
│   └── 토큰 사용량 표시
├── 토큰 경고 배너 (조건부)
├── 메인 대시보드
│   ├── 지시 입력 영역
│   ├── 에이전트 카드 x5 (파이프라인 진행 상황)
│   └── 진행률 바
├── 결과 패널 (완료 시)
│   ├── PRD 탭
│   ├── 설계 탭
│   ├── 코드 탭 (파일 트리 + 코드 뷰어)
│   └── QA 리포트 탭
└── 세션 목록 패널 (사이드바)
```

### 7.2 에이전트 카드 상태

| 상태 | 색상 | 설명 |
|------|------|------|
| idle | 회색 | 대기 중 |
| working | 파란색 | 작업 중 (로딩 애니메이션) |
| done | 초록색 | 완료 |
| error | 빨간색 | 오류 |

### 7.3 UX 원칙
- **단순함**: 입력창 하나, 버튼 하나로 시작
- **실시간성**: 에이전트 상태 변화를 즉시 반영
- **투명성**: 각 에이전트 결과물을 클릭으로 확인 가능
- **피드백**: 로딩, 완료, 에러 상태를 명확히 표시

---

## 8. 비기능 요구사항

### 8.1 성능
- API 응답 시간: 에이전트당 최대 30초 (Claude API 호출 포함)
- 전체 파이프라인: 최대 3분 이내 완료 목표

### 8.2 보안
- Anthropic API 키는 서버에서만 사용 (프론트엔드 노출 금지)
- 모든 API 입력값 Zod 스키마 검증
- Rate limiting: 분당 10회 요청 제한
- CORS: 개발 환경 `localhost:5173`, 프로덕션 환경 설정 필요

### 8.3 가용성
- 단일 서버 구성 (MVP 단계)
- 서버 재시작 시 세션 데이터 보존 (파일 기반 저장)

### 8.4 확장성 (MVP 이후)
- 데이터베이스 전환 (파일 → PostgreSQL)
- 스트리밍 응답 지원
- 사용자 인증 추가

---

## 9. 제약 사항

| 제약 | 내용 |
|------|------|
| 토큰 한도 | 월 50,000 토큰 (하드코딩, 환경변수로 조정 가능) |
| QA 루프 | 최대 3회 (하드코딩) |
| 파일 저장 | JSON 파일 기반 (DB 없음, MVP) |
| 지시 길이 | 최대 2,000자 |
| 생성 코드 | React + TypeScript + Tailwind 고정 |

---

## 10. 마일스톤

| Phase | 내용 | 산출물 |
|-------|------|--------|
| Phase 1 | 프로젝트 초기화 | package.json, tsconfig, 환경변수 |
| Phase 2 | 백엔드 기반 구축 | Express 서버, 타입, 미들웨어 |
| Phase 3 | 에이전트 파이프라인 | 5개 에이전트 + workflow.ts |
| Phase 4 | API 라우트 | generate, sessions, tokens |
| Phase 5 | 프론트엔드 기반 | Vite 설정, Zustand, API 클라이언트 |
| Phase 6 | UI 컴포넌트 | 대시보드, 모달, 패널 |
| Phase 7 | 통합 및 마무리 | 전체 E2E 테스트, 문서화 |

# AI 타이쿤 — 구현 계획 (PLAN)

- **작성일**: 2026-03-08
- **버전**: 1.0.0

---

## 전체 진행 상황

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 프로젝트 초기화 | ✅ 완료 |
| Phase 2 | 백엔드 기반 구축 | ✅ 완료 |
| Phase 3 | 에이전트 파이프라인 | ⬜ 미시작 |
| Phase 4 | API 라우트 | ⬜ 미시작 |
| Phase 5 | 프론트엔드 기반 | ⬜ 미시작 |
| Phase 6 | UI 컴포넌트 | ⬜ 미시작 |
| Phase 7 | 통합 및 마무리 | ⬜ 미시작 |

---

## Phase 1 — 프로젝트 초기화

### 목표
개발 환경을 구성하고 빌드/실행이 가능한 상태를 만든다.

### 작업 목록

#### 1-1. 백엔드 패키지 설정
- [ ] `backend/package.json` 작성
  - 의존성: `express`, `@anthropic-ai/sdk`, `zod`, `cors`, `express-rate-limit`, `uuid`
  - 개발 의존성: `typescript`, `tsx`, `@types/express`, `@types/node`, `@types/cors`, `@types/uuid`
  - 스크립트: `dev`, `build`, `start`, `typecheck`
- [ ] `backend/tsconfig.json` 작성 (strict 모드, ESNext, NodeNext)
- [ ] `backend/.env.example` 작성
- [ ] `backend/.gitignore` 확인

#### 1-2. 프론트엔드 패키지 설정
- [ ] `frontend/package.json` 작성
  - 의존성: `react`, `react-dom`, `zustand`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
  - 개발 의존성: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `autoprefixer`, `postcss`
  - 스크립트: `dev`, `build`, `preview`, `typecheck`
- [ ] `frontend/tsconfig.json` 작성
- [ ] `frontend/vite.config.ts` 작성 (경로 별칭 `@/` 설정)
- [ ] `frontend/tailwind.config.ts` 작성
- [ ] `frontend/postcss.config.js` 작성
- [ ] `frontend/index.html` 작성
- [ ] `frontend/.env.example` 작성

#### 1-3. 공통 설정
- [ ] 루트 `.gitignore` 작성 (node_modules, .env, dist, *.shrimp)

---

## Phase 2 — 백엔드 기반 구축

### 목표
Express 서버가 기동되고 기본 미들웨어가 작동하는 상태.

### 작업 목록

#### 2-1. 타입 정의
- [ ] `backend/src/types/index.ts`
  - `AgentStatus`, `SessionStatus` 타입
  - `AgentState`, `PipelineState`, `Session` 인터페이스
  - `FileOutput`, `TokenUsage` 인터페이스
  - API 요청/응답 타입

#### 2-2. 환경변수 검증
- [ ] `backend/src/config/env.ts`
  - Zod 스키마로 모든 환경변수 검증
  - 미설정 시 즉시 throw (서버 기동 불가)

#### 2-3. Anthropic 클라이언트
- [ ] `backend/src/lib/claude.ts`
  - 싱글턴 Anthropic 클라이언트
  - 모델: `claude-opus-4-6` (기본), 에이전트별 변경 가능
  - 호출 헬퍼 함수 (메시지 빌더)

#### 2-4. 토큰 카운터
- [ ] `backend/src/lib/tokenCounter.ts`
  - JSON 파일 기반 월별 토큰 사용량 저장
  - `addTokens(count)` — 사용량 누적
  - `getUsage()` — 현재 사용량 반환
  - `isExceeded()` — 한도 초과 여부
  - `isWarning()` — 경고 임계값 초과 여부

#### 2-5. 세션 저장소
- [ ] `backend/src/lib/sessionStore.ts`
  - JSON 파일 기반 (`sessions/` 디렉토리)
  - `createSession(instruction)` — 새 세션 생성
  - `updateSession(id, updates)` — 세션 업데이트
  - `getSession(id)` — 세션 조회
  - `listSessions()` — 전체 세션 목록

#### 2-6. 미들웨어
- [ ] `backend/src/middleware/errorHandler.ts`
  - 글로벌 에러 핸들러
  - Zod 검증 오류 처리
  - 일관된 에러 응답 형식
- [ ] `backend/src/middleware/rateLimiter.ts`
  - 분당 10회 제한
  - 한도 초과 시 429 응답

#### 2-7. Express 서버 진입점
- [ ] `backend/src/index.ts`
  - CORS 설정
  - JSON 바디 파서
  - Rate limiter 적용
  - 라우트 마운트
  - 에러 핸들러 등록
  - 서버 기동 로그

---

## Phase 3 — 에이전트 파이프라인

### 목표
5개 에이전트와 오케스트레이터가 완성되어 파이프라인이 실행 가능한 상태.

### 작업 목록

#### 3-1. 매니저 에이전트
- [ ] `backend/src/agents/managerAgent.ts`
  - Claude API로 명확성 점수 산출 (시스템 프롬프트 설계)
  - 0.7 미만 → 추가 질문 3개 생성
  - 0.7 이상 → 지시 정제 후 반환
  - 출력 타입: `ManagerResult`

#### 3-2. 기획자 에이전트
- [ ] `backend/src/agents/plannerAgent.ts`
  - 정제된 지시로 PRD 마크다운 생성
  - 포함 항목: 제품 개요, 기능 목록, 사용자 스토리, 데이터 모델
  - 출력: 마크다운 문자열

#### 3-3. 디자이너 에이전트
- [ ] `backend/src/agents/designerAgent.ts`
  - PRD 기반 UI 구조 설계 문서 생성
  - 포함 항목: 페이지 목록, 컴포넌트 트리, 데이터 플로우
  - 출력: 마크다운 문자열

#### 3-4. 개발자 에이전트
- [ ] `backend/src/agents/developerAgent.ts`
  - PRD + UI 설계 + (QA 피드백) 기반 코드 생성
  - React + TypeScript + Tailwind 고정
  - 출력: `FileOutput[]` (JSON 파싱)
  - QA 피드백 있을 경우 반영

#### 3-5. QA 에이전트
- [ ] `backend/src/agents/qaAgent.ts`
  - 생성된 코드 검토 (타입, 구조, 보안, 누락 기능)
  - 통과/실패 판정
  - 실패 시 구체적인 피드백 생성
  - 출력: `QAResult`

#### 3-6. 파이프라인 오케스트레이터
- [ ] `backend/src/lib/workflow.ts`
  - 전체 파이프라인 실행 관리
  - 세션 상태 업데이트 (각 단계 완료 시)
  - 토큰 사용량 추적
  - QA 루프 관리 (최대 3회)
  - 에러 처리 및 세션 상태 반영

---

## Phase 4 — API 라우트

### 목표
3개 엔드포인트가 완성되어 프론트엔드와 통신 가능한 상태.

### 작업 목록

#### 4-1. generate 라우트
- [ ] `backend/src/routes/generate.ts`
  - `POST /api/generate`
  - Zod 입력 검증 (`instruction`, `sessionId?`, `clarification?`)
  - 토큰 한도 초과 시 차단 (403 응답)
  - `workflow.ts` 호출
  - 응답: 완료 결과 또는 추가 질문

#### 4-2. sessions 라우트
- [ ] `backend/src/routes/sessions.ts`
  - `GET /api/sessions` — 전체 목록
  - `GET /api/sessions/:id` — 세션 상세
  - 존재하지 않는 ID → 404 응답

#### 4-3. tokens 라우트
- [ ] `backend/src/routes/tokens.ts`
  - `GET /api/tokens`
  - 현재 토큰 사용량, 한도, 경고 여부 반환

---

## Phase 5 — 프론트엔드 기반

### 목표
Vite 개발 서버가 실행되고 백엔드 API 호출이 가능한 상태.

### 작업 목록

#### 5-1. 타입 정의
- [ ] `frontend/src/types/index.ts`
  - 백엔드 API 응답 타입 (백엔드와 동기화)
  - `AgentStatus`, `SessionStatus`
  - `Session`, `PipelineState`, `AgentState`
  - `TokenUsage`, `FileOutput`

#### 5-2. 유틸리티
- [ ] `frontend/src/lib/utils.ts`
  - `cn()` — clsx + tailwind-merge 조합
- [ ] `frontend/src/lib/api.ts`
  - `generateApp(instruction, sessionId?, clarification?)` — POST /api/generate
  - `getSessions()` — GET /api/sessions
  - `getSession(id)` — GET /api/sessions/:id
  - `getTokenUsage()` — GET /api/tokens
  - 에러 핸들링 (네트워크, HTTP 에러)

#### 5-3. Zustand 스토어 (hooks)
- [ ] `frontend/src/hooks/useWorkflow.ts`
  - 파이프라인 실행 상태 (`idle`, `running`, `completed`, `error`)
  - 현재 실행 중인 에이전트 추적
  - `run(instruction)` 액션
  - `reset()` 액션
- [ ] `frontend/src/hooks/useSessions.ts`
  - 세션 목록 조회 및 캐싱
  - 선택된 세션 상태
  - `selectSession(id)` 액션
- [ ] `frontend/src/hooks/useTokens.ts`
  - 토큰 사용량 조회
  - 30초 주기 자동 갱신

#### 5-4. 앱 진입점
- [ ] `frontend/src/main.tsx`
- [ ] `frontend/src/App.tsx`
  - 레이아웃 구조 (헤더, 사이드바, 메인)
  - 토큰 경고 배너 조건부 렌더링

---

## Phase 6 — UI 컴포넌트

### 목표
전체 UI가 완성되어 실제 사용 가능한 상태.

### 작업 목록

#### 6-1. 기본 UI 컴포넌트 (`components/ui/`)
- [ ] `Button.tsx` — CVA 기반 (variant: primary, secondary, ghost)
- [ ] `Card.tsx` — CVA 기반 (status: idle, working, done, error)
- [ ] `Badge.tsx` — 상태 표시 뱃지
- [ ] `Dialog.tsx` — 모달 래퍼
- [ ] `Progress.tsx` — 진행률 바

#### 6-2. 대시보드 컴포넌트 (`components/dashboard/`)
- [ ] `AgentCard.tsx`
  - 에이전트 이름, 역할 설명, 상태 표시
  - 상태별 색상 (idle: 회색, working: 파란색, done: 초록색, error: 빨간색)
  - working 상태: 로딩 스피너 애니메이션
  - 클릭 시 상세 모달 열기
- [ ] `PipelineBar.tsx`
  - 5단계 진행률 표시
  - 현재 단계 하이라이트
  - 퍼센트 표시
- [ ] `TokenWarning.tsx`
  - 80% 이상 시 경고 배너 표시
  - 사용량/한도 수치 표시

#### 6-3. 모달 컴포넌트 (`components/modals/`)
- [ ] `InputModal.tsx`
  - 지시 입력 텍스트 에어리어 (최대 2000자)
  - 글자수 카운터
  - 제출 버튼
  - 추가 질문 표시 모드 (매니저가 질문 반환 시)
- [ ] `AgentDetailModal.tsx`
  - 에이전트 결과물 전체 표시
  - 마크다운 렌더링 (PRD, 설계 문서)
  - 코드 표시 (개발자 결과물)

#### 6-4. 패널 컴포넌트 (`components/panels/`)
- [ ] `ResultPanel.tsx`
  - 탭 UI: PRD / 설계 / 코드 / QA 리포트
  - 코드 탭: 파일 목록 + 코드 뷰어
  - 복사 버튼 (각 파일 코드)
- [ ] `SessionList.tsx`
  - 이전 세션 목록 (최신순)
  - 세션 상태 뱃지
  - 클릭 시 해당 세션 결과 표시

---

## Phase 7 — 통합 및 마무리

### 목표
전체 파이프라인이 E2E로 동작하고 배포 가능한 상태.

### 작업 목록

#### 7-1. 통합 테스트
- [ ] 백엔드 서버 기동 확인 (`npm run dev`)
- [ ] 프론트엔드 개발 서버 기동 확인 (`npm run dev`)
- [ ] E2E 시나리오 테스트:
  - 명확한 지시 → 파이프라인 완료 → 결과 표시
  - 불명확한 지시 → 추가 질문 → 재입력 → 완료
  - 토큰 경고 배너 표시 확인
- [ ] TypeScript 타입 검사 (`npm run typecheck`)

#### 7-2. 에러 시나리오 검증
- [ ] API 키 없을 때 서버 기동 차단
- [ ] 토큰 한도 초과 시 파이프라인 차단
- [ ] QA 3회 초과 시 강제 완료
- [ ] 네트워크 에러 시 프론트엔드 에러 표시

#### 7-3. 문서화
- [ ] `README.md` 작성 (설치 및 실행 방법)
- [ ] `PLAN.md` 진행 상황 업데이트

---

## 의존성 관계

```
Phase 1 (초기화)
    ↓
Phase 2 (백엔드 기반) ──→ Phase 5 (프론트엔드 기반)
    ↓                           ↓
Phase 3 (에이전트)       Phase 6 (UI 컴포넌트)
    ↓
Phase 4 (API 라우트)
    ↓
Phase 7 (통합)
```

Phase 2 완료 후 Phase 3과 Phase 5는 병렬 진행 가능.

---

## 에이전트 시스템 프롬프트 가이드

각 에이전트의 시스템 프롬프트 작성 시 원칙:

1. **역할 명확화**: "당신은 [역할]입니다" 로 시작
2. **출력 형식 명시**: JSON 또는 마크다운 구조를 정확히 지정
3. **예시 포함**: 입력/출력 예시를 포함하여 일관성 확보
4. **한국어 응답**: 모든 에이전트는 한국어로 응답
5. **코드 생성 시**: 반드시 React + TypeScript + Tailwind 사용 명시

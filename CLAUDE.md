# 🤖 AI 타이쿤 (AI Tycoon) — Claude Code 개발 지침

## 프로젝트 개요

비개발자 사장님이 자연어로 "OO 만들어줘"라고 입력하면,
5개 AI 에이전트(매니저·기획자·디자이너·개발자·QA)가 자동으로
기획 → 설계 → 개발 → 검토 파이프라인을 실행하여
실제 동작하는 웹앱 코드를 생성해주는 플랫폼.

- **버전**: 1.0.0
- **작성일**: 2026-03-08
- **PRD**: `docs/PRD.md` 참조

---

## 기술 스택

### 백엔드 (`backend/`)
| 항목 | 기술 |
|------|------|
| 런타임 | Node.js v24+ |
| 프레임워크 | Express 5 |
| 언어 | TypeScript 5 (strict) |
| AI SDK | @anthropic-ai/sdk |
| 검증 | Zod |
| 개발 실행 | tsx watch |
| 포트 | 3001 |

### 프론트엔드 (`frontend/`)
| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 |
| 번들러 | Vite 5 |
| 언어 | TypeScript 5 (strict) |
| 스타일링 | Tailwind CSS 3.4 |
| UI 컴포넌트 | shadcn/ui 패턴 (CVA 기반) |
| 상태관리 | Zustand |
| 아이콘 | Lucide React |
| 포트 | 5173 |

---

## 디렉토리 구조

```
ai-tycoon/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express 서버 진입점
│   │   ├── config/
│   │   │   └── env.ts            # Zod 환경변수 검증
│   │   ├── types/
│   │   │   └── index.ts          # 공통 타입 정의
│   │   ├── lib/
│   │   │   ├── claude.ts         # Anthropic SDK 클라이언트 (서버 전용)
│   │   │   ├── tokenCounter.ts   # 토큰 카운팅 + 한도 관리
│   │   │   ├── workflow.ts       # 파이프라인 오케스트레이터
│   │   │   └── sessionStore.ts   # JSON 기반 세션 저장
│   │   ├── agents/
│   │   │   ├── managerAgent.ts   # 매니저: 지시 수신 + 불명확 시 질문 반환
│   │   │   ├── plannerAgent.ts   # 기획자: PRD 문서 생성
│   │   │   ├── designerAgent.ts  # 디자이너: UI 설계
│   │   │   ├── developerAgent.ts # 개발자: 코드 생성
│   │   │   └── qaAgent.ts        # QA: 검토 (최대 3회 루프)
│   │   ├── routes/
│   │   │   ├── generate.ts       # POST /api/generate
│   │   │   ├── sessions.ts       # GET|POST /api/sessions
│   │   │   └── tokens.ts         # GET /api/tokens
│   │   └── middleware/
│   │       ├── errorHandler.ts   # 글로벌 에러 핸들러
│   │       └── rateLimiter.ts    # Rate limiting
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── types/
│   │   │   └── index.ts          # 공통 타입
│   │   ├── lib/
│   │   │   ├── utils.ts          # cn() Tailwind 병합 유틸
│   │   │   └── api.ts            # API 클라이언트 (백엔드 호출만)
│   │   ├── hooks/
│   │   │   ├── useWorkflow.ts    # 파이프라인 실행 상태
│   │   │   ├── useSessions.ts    # 세션 관리
│   │   │   └── useTokens.ts      # 토큰 사용량
│   │   └── components/
│   │       ├── ui/               # 기본 UI (Button, Card, Badge, Dialog, Progress)
│   │       ├── dashboard/
│   │       │   ├── AgentCard.tsx       # 에이전트 카드
│   │       │   ├── PipelineBar.tsx     # 진행률 바
│   │       │   └── TokenWarning.tsx    # 토큰 경고 배너
│   │       ├── modals/
│   │       │   ├── AgentDetailModal.tsx  # 에이전트 상세 팝업
│   │       │   └── InputModal.tsx        # 지시 입력창
│   │       └── panels/
│   │           ├── ResultPanel.tsx    # 결과 표시
│   │           └── SessionList.tsx    # 세션 목록
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── docs/
│   └── PRD.md                    # 제품 요구사항 문서
├── .mcp.json                     # Shrimp Task Manager MCP 설정
├── .gitignore
├── CLAUDE.md                     # 이 파일
└── README.md
```

---

## 개발 명령어

### 백엔드
```bash
cd backend

# 패키지 설치
npm install

# 개발 서버 시작 (자동 재시작)
npm run dev

# TypeScript 빌드
npm run build

# 타입 검사
npm run typecheck

# 프로덕션 실행
npm start
```

### 프론트엔드
```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 타입 검사
npm run typecheck

# 빌드 결과 미리보기
npm run preview
```

---

## 환경변수 설정

### 백엔드 (`backend/.env`)
```env
# Anthropic API 키 (필수)
ANTHROPIC_API_KEY=sk-ant-api03-...

# 서버 포트 (기본값: 3001)
PORT=3001

# 월 토큰 한도 (기본값: 50000)
MONTHLY_TOKEN_LIMIT=50000

# 경고 임계값 비율 (기본값: 0.8 = 80%)
TOKEN_WARNING_THRESHOLD=0.8

# 환경 (development | production)
NODE_ENV=development
```

### 프론트엔드 (`frontend/.env`)
```env
# 백엔드 API URL
VITE_API_URL=http://localhost:3001
```

> ⚠️ `.env` 파일은 절대 git에 포함하지 않습니다. `.env.example`을 복사해서 사용하세요.

---

## 코딩 컨벤션

### 기본 규칙
- **들여쓰기**: 2칸 (스페이스)
- **언어**: 주석·문서 한국어 / 변수·함수명 영어
- **파일 크기**: 최대 800줄 (초과 시 분리)
- **함수 크기**: 최대 50줄
- **중첩 깊이**: 최대 4단계
- **any 타입**: 절대 사용 금지

### 불변성 (CRITICAL)
```typescript
// ❌ 금지: 객체 직접 수정
state.agent.status = 'working'

// ✅ 올바른 방법: 새 객체 생성
return { ...state, agent: { ...state.agent, status: 'working' } }
```

### 환경변수 검증 (필수)
```typescript
// backend/src/config/env.ts 에서 Zod로 검증
import { z } from 'zod'
const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'API 키가 없습니다'),
  PORT: z.string().default('3001').transform(Number),
})
export const env = envSchema.parse(process.env)
```

### API 입력 검증 (필수)
```typescript
// 모든 API 엔드포인트에서 Zod 스키마 사용
const generateSchema = z.object({
  instruction: z.string().min(1, '지시사항을 입력해주세요').max(2000),
})
const body = generateSchema.parse(req.body)
```

### UI 컴포넌트 패턴 (CVA 기반)
```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-lg border p-4', {
  variants: {
    status: {
      idle: 'border-gray-200 bg-gray-50',
      working: 'border-blue-300 bg-blue-50',
      reviewing: 'border-yellow-300 bg-yellow-50',
      done: 'border-green-300 bg-green-50',
    },
  },
  defaultVariants: { status: 'idle' },
})
```

---

## 보안 체크리스트

커밋 전 반드시 확인:
- [ ] `ANTHROPIC_API_KEY` 코드에 하드코딩 없음
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프론트엔드에서 Claude API 직접 호출 없음
- [ ] `dangerouslyAllowBrowser: true` 없음
- [ ] 모든 API 입력값 Zod로 검증됨
- [ ] 에러 메시지에 API 키 포함 없음

---

## 에이전트 파이프라인

```
사장님 입력
    ↓
매니저 에이전트 (불명확 → 질문 반환, 명확 → 다음 단계)
    ↓
기획자 에이전트 (PRD 마크다운 생성)
    ↓
디자이너 에이전트 (UI 구조 설계)
    ↓
개발자 에이전트 (프론트+백엔드 코드 생성)
    ↓
QA 에이전트 (코드 검토)
    ├─ 통과 → 결과 표시
    └─ 실패 → 개발자에게 피드백 (최대 3회, 하드코딩)
```

### 비용 안전장치
- 월 토큰 한도: 기본 50,000 토큰
- 80% 도달 시: 프론트엔드 경고 배너 표시
- QA 루프: **최대 3회** (초과 시 현재 상태로 강제 완료)

---

## Shrimp Task Manager 연동

`.mcp.json` 파일로 Shrimp Task Manager MCP가 연동되어 있습니다.
Claude Code에서 작업 목록 관리, 의존성 추적, 진행 상황 저장에 활용합니다.

```bash
# 작업 데이터 위치
ai-tycoon/.shrimp/
```

---

## 커밋 메시지 형식

```
<type>: <한국어 설명>

<optional body>
```

Types: `feat`(새기능) | `fix`(버그수정) | `refactor`(리팩토링) | `docs`(문서) | `test`(테스트) | `chore`(설정) | `perf`(성능) | `ci`(CI/CD)

예시:
```
feat: 매니저 에이전트 모호한 지시 감지 기능 추가

사장님 지시가 불명확할 경우 추가 질문을 반환하는 로직 구현.
Claude API를 통해 명확성 점수(0-1)를 계산하여 0.7 미만 시 질문 생성.
```

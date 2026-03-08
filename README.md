# 🤖 AI 타이쿤

> 자연어로 지시하면 5명의 AI 팀원이 자동으로 웹앱을 만들어주는 플랫폼

비개발자 사장님이 "OO 만들어줘"라고 입력하면, 매니저·기획자·디자이너·개발자·QA 에이전트가 자동으로 기획 → 설계 → 개발 → 검토 파이프라인을 실행하여 실제 동작하는 React 앱 코드를 생성합니다.

---

## 주요 기능

- **5단계 AI 파이프라인**: 매니저 → 기획자 → 디자이너 → 개발자 → QA 자동 실행
- **UI 설계 승인 과정**: 디자이너 완료 후 사장님이 레이아웃을 확인하고 승인
- **추가 질문**: 지시가 불명확할 경우 매니저가 3개 질문 반환
- **QA 루프**: 최대 3회 코드 검토 및 자동 수정
- **토큰 관리**: 월 사용량 추적, 80% 경고 배너, 초과 시 차단
- **세션 이력**: 이전 작업 결과 저장 및 재조회

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Node.js 24+, Express 5, TypeScript 5 (strict) |
| AI | Anthropic Claude API (`claude-opus-4-6`) |
| 프론트엔드 | React 18, Vite 5, TypeScript 5 |
| 스타일링 | Tailwind CSS 3.4, CVA |
| 상태관리 | Zustand |
| 검증 | Zod |

---

## 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/jjh3502/ai-tycoon.git
cd ai-tycoon
```

### 2. 백엔드 설정

```bash
cd backend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 ANTHROPIC_API_KEY 입력
```

### 3. 프론트엔드 설정

```bash
cd ../frontend
npm install

# 환경변수 설정 (기본값으로 동작하므로 선택사항)
cp .env.example .env
```

### 4. 서버 실행

터미널 1 — 백엔드:
```bash
cd backend
npm run dev
# → http://localhost:3001
```

터미널 2 — 프론트엔드:
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

브라우저에서 http://localhost:5173 접속

---

## 환경변수

### `backend/.env`

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `ANTHROPIC_API_KEY` | ✅ | — | Anthropic API 키 |
| `PORT` | | 3001 | 서버 포트 |
| `MONTHLY_TOKEN_LIMIT` | | 50000 | 월 토큰 한도 |
| `TOKEN_WARNING_THRESHOLD` | | 0.8 | 경고 임계값 (80%) |
| `NODE_ENV` | | development | 실행 환경 |

### `frontend/.env`

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `VITE_API_URL` | | http://localhost:3001 | 백엔드 API URL |

---

## 파이프라인 흐름

```
사장님 입력
    ↓
매니저 에이전트
├─ 불명확 → 추가 질문 3개 반환 → 사장님 답변 → 재실행
└─ 명확 → 지시 정제
    ↓
기획자 에이전트 → PRD 문서 생성
    ↓
디자이너 에이전트 → UI 구조 설계
    ↓
⏸ 사장님 UI 설계 승인
    ↓ 승인
개발자 에이전트 → React + TypeScript + Tailwind 코드 생성
    ↓
QA 에이전트 → 코드 검토
├─ 통과 → 결과 표시
└─ 실패 → 개발자에게 피드백 (최대 3회)
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/generate` | 파이프라인 실행 |
| `GET` | `/api/sessions` | 세션 목록 조회 |
| `GET` | `/api/sessions/:id` | 세션 상세 조회 |
| `GET` | `/api/tokens` | 토큰 사용량 조회 |
| `GET` | `/health` | 서버 헬스체크 |

### `POST /api/generate` 요청 바디

```json
{
  "instruction": "근태 관리 앱 만들어줘",
  "sessionId": "uuid (재시도 시)",
  "clarification": "추가 질문 답변",
  "approved": true
}
```

---

## 디렉토리 구조

```
ai-tycoon/
├── backend/
│   └── src/
│       ├── agents/         # 5개 AI 에이전트
│       ├── config/         # 환경변수 검증
│       ├── lib/            # Claude 클라이언트, 워크플로우, 세션/토큰 저장소
│       ├── middleware/      # 에러 핸들러, Rate limiter
│       └── routes/         # API 라우트
├── frontend/
│   └── src/
│       ├── components/     # UI, 대시보드, 모달, 패널 컴포넌트
│       ├── hooks/          # Zustand 스토어
│       ├── lib/            # API 클라이언트, 유틸
│       └── types/          # 타입 정의
└── docs/
    ├── PRD.md
    └── PLAN.md
```

---

## 보안 주의사항

- `ANTHROPIC_API_KEY`는 절대 커밋하지 마세요 (`.gitignore` 적용됨)
- 프론트엔드에서 Claude API를 직접 호출하지 않습니다 (백엔드 경유)
- Rate limiting: API 요청 분당 10회 제한

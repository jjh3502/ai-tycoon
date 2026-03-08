import { runManagerAgent } from '../agents/managerAgent.js'
import { runPlannerAgent } from '../agents/plannerAgent.js'
import { runDesignerAgent } from '../agents/designerAgent.js'
import { runDeveloperAgent } from '../agents/developerAgent.js'
import { runQAAgent } from '../agents/qaAgent.js'
import { updateSession } from './sessionStore.js'
import { addTokens } from './tokenCounter.js'
import type { Session, AgentName, PipelineState, FileOutput } from '../types/index.js'

// QA 루프 최대 횟수 (하드코딩)
const MAX_QA_ITERATIONS = 3

// 에이전트 상태 업데이트 헬퍼
function setAgentWorking(pipeline: PipelineState, agent: AgentName): PipelineState {
  return {
    ...pipeline,
    agents: {
      ...pipeline.agents,
      [agent]: {
        ...pipeline.agents[agent],
        status: 'working',
        startedAt: new Date().toISOString(),
        error: null,
      },
    },
  }
}

function setAgentDone(
  pipeline: PipelineState,
  agent: AgentName,
  output: string,
): PipelineState {
  return {
    ...pipeline,
    agents: {
      ...pipeline.agents,
      [agent]: {
        ...pipeline.agents[agent],
        status: 'done',
        output,
        completedAt: new Date().toISOString(),
      },
    },
  }
}

function setAgentError(
  pipeline: PipelineState,
  agent: AgentName,
  error: string,
): PipelineState {
  return {
    ...pipeline,
    agents: {
      ...pipeline.agents,
      [agent]: {
        ...pipeline.agents[agent],
        status: 'error',
        error,
        completedAt: new Date().toISOString(),
      },
    },
  }
}

// 파이프라인 전체 실행
export async function runWorkflow(
  session: Session,
  clarification?: string,
  approved?: boolean,
): Promise<Session> {
  const sessionId = session.id
  let pipeline = { ...session.pipeline }

  try {
    // ── 승인 후 재개: 개발자 단계부터 시작 ──────────────────────
    if (session.status === 'awaiting_approval' && approved === true) {
      const prd = session.pipeline.agents.planner.output ?? ''
      const uiDesign = session.pipeline.agents.designer.output ?? ''
      return await runDeveloperQALoop(sessionId, pipeline, prd, uiDesign, session.files)
    }

    // ── Step 0: 매니저 에이전트 ──────────────────────────────────
    pipeline = { ...setAgentWorking(pipeline, 'manager'), currentStep: 0 }
    updateSession(sessionId, { pipeline, status: 'running' })

    const instruction = clarification
      ? `${session.instruction}\n\n추가 정보: ${clarification}`
      : session.instruction

    const { result: managerResult, tokens: managerTokens } =
      await runManagerAgent(instruction)
    addTokens(managerTokens)

    // 명확성 부족 → 추가 질문 반환
    if (managerResult.needsClarification) {
      pipeline = setAgentDone(
        pipeline,
        'manager',
        JSON.stringify(managerResult, null, 2),
      )
      return updateSession(sessionId, {
        pipeline,
        status: 'clarifying',
        clarificationQuestions: managerResult.questions,
      }) as Session
    }

    pipeline = setAgentDone(
      pipeline,
      'manager',
      managerResult.refinedInstruction,
    )
    updateSession(sessionId, {
      pipeline,
      refinedInstruction: managerResult.refinedInstruction,
    })

    const refinedInstruction = managerResult.refinedInstruction

    // ── Step 1: 기획자 에이전트 ──────────────────────────────────
    pipeline = { ...setAgentWorking(pipeline, 'planner'), currentStep: 1 }
    updateSession(sessionId, { pipeline })

    const { prd, tokens: plannerTokens } = await runPlannerAgent(refinedInstruction)
    addTokens(plannerTokens)

    pipeline = setAgentDone(pipeline, 'planner', prd)
    updateSession(sessionId, { pipeline })

    // ── Step 2: 디자이너 에이전트 ────────────────────────────────
    pipeline = { ...setAgentWorking(pipeline, 'designer'), currentStep: 2 }
    updateSession(sessionId, { pipeline })

    const { uiDesign, tokens: designerTokens } = await runDesignerAgent(prd)
    addTokens(designerTokens)

    pipeline = setAgentDone(pipeline, 'designer', uiDesign)

    // ── 승인 대기: 사장님에게 UI 설계 확인 요청 ──────────────────
    return updateSession(sessionId, {
      pipeline,
      status: 'awaiting_approval',
    }) as Session
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류'
    const agents: AgentName[] = ['manager', 'planner', 'designer', 'developer', 'qa']
    const workingAgent = agents.find(
      (name) => pipeline.agents[name].status === 'working',
    )
    if (workingAgent) {
      pipeline = setAgentError(pipeline, workingAgent, errorMsg)
    }
    return updateSession(sessionId, { status: 'failed', pipeline }) as Session
  }
}

// 개발자 + QA 루프 (승인 후 실행)
async function runDeveloperQALoop(
  sessionId: string,
  pipeline: PipelineState,
  prd: string,
  uiDesign: string,
  initialFiles: FileOutput[],
): Promise<Session> {
  let qaFeedback: string | undefined
  let finalFiles = initialFiles

  try {
    // ── Step 3~4: 개발자 + QA 루프 (최대 3회) ───────────────────

    for (let iteration = 0; iteration < MAX_QA_ITERATIONS; iteration++) {
      // 개발자 에이전트
      pipeline = {
        ...setAgentWorking(pipeline, 'developer'),
        currentStep: 3,
      }
      updateSession(sessionId, { pipeline })

      const { files, tokens: devTokens } = await runDeveloperAgent(
        prd,
        uiDesign,
        qaFeedback,
      )
      addTokens(devTokens)
      finalFiles = files

      pipeline = setAgentDone(
        pipeline,
        'developer',
        JSON.stringify({ fileCount: files.length }, null, 2),
      )
      updateSession(sessionId, { pipeline, files })

      // QA 에이전트
      pipeline = {
        ...setAgentWorking(pipeline, 'qa'),
        currentStep: 4,
        qaIteration: iteration + 1,
      }
      updateSession(sessionId, { pipeline })

      const { result: qaResult, tokens: qaTokens } = await runQAAgent(prd, files)
      addTokens(qaTokens)

      pipeline = setAgentDone(
        pipeline,
        'qa',
        JSON.stringify(qaResult, null, 2),
      )
      updateSession(sessionId, { pipeline })

      // QA 통과 또는 마지막 iteration
      if (qaResult.passed || iteration === MAX_QA_ITERATIONS - 1) {
        break
      }

      // QA 실패 → 피드백을 다음 개발자 호출에 전달
      qaFeedback = qaResult.feedback
    }

    // ── 완료 ────────────────────────────────────────────────────
    return updateSession(sessionId, {
      status: 'completed',
      pipeline,
      files: finalFiles,
    }) as Session
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류'
    const agents: AgentName[] = ['developer', 'qa']
    const workingAgent = agents.find(
      (name) => pipeline.agents[name].status === 'working',
    )
    if (workingAgent) {
      pipeline = setAgentError(pipeline, workingAgent, errorMsg)
    }
    return updateSession(sessionId, { status: 'failed', pipeline }) as Session
  }
}

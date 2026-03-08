import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { env } from '../config/env.js'
import type { TokenUsage } from '../types/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../data')
const TOKEN_FILE = join(DATA_DIR, 'tokens.json')

// 현재 월 키 (YYYY-MM 형식)
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

// 토큰 데이터 파일 구조
interface TokenData {
  month: string
  used: number
}

// 저장된 토큰 데이터 로드
function loadTokenData(): TokenData {
  if (!existsSync(TOKEN_FILE)) {
    return { month: getCurrentMonth(), used: 0 }
  }

  try {
    const raw = readFileSync(TOKEN_FILE, 'utf-8')
    const data = JSON.parse(raw) as TokenData
    // 월이 바뀌었으면 초기화
    if (data.month !== getCurrentMonth()) {
      return { month: getCurrentMonth(), used: 0 }
    }
    return data
  } catch {
    return { month: getCurrentMonth(), used: 0 }
  }
}

// 토큰 데이터 저장
function saveTokenData(data: TokenData): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// 토큰 사용량 추가
export function addTokens(count: number): void {
  const data = loadTokenData()
  const updated: TokenData = {
    ...data,
    used: data.used + count,
  }
  saveTokenData(updated)
}

// 현재 사용량 조회
export function getUsage(): TokenUsage {
  const data = loadTokenData()
  const limit = env.MONTHLY_TOKEN_LIMIT
  const threshold = env.TOKEN_WARNING_THRESHOLD

  return {
    used: data.used,
    limit,
    warningThreshold: threshold,
    isWarning: data.used >= limit * threshold,
    isExceeded: data.used >= limit,
    month: data.month,
  }
}

// 한도 초과 여부
export function isExceeded(): boolean {
  return getUsage().isExceeded
}

// 경고 임계값 초과 여부
export function isWarning(): boolean {
  return getUsage().isWarning
}

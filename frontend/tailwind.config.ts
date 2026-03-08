import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 에이전트 상태 색상
        agent: {
          idle: {
            bg: '#F9FAFB',
            border: '#E5E7EB',
            text: '#6B7280',
          },
          working: {
            bg: '#EFF6FF',
            border: '#93C5FD',
            text: '#1D4ED8',
          },
          reviewing: {
            bg: '#FFFBEB',
            border: '#FCD34D',
            text: '#92400E',
          },
          done: {
            bg: '#F0FDF4',
            border: '#86EFAC',
            text: '#15803D',
          },
          error: {
            bg: '#FFF1F2',
            border: '#FDA4AF',
            text: '#BE123C',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config

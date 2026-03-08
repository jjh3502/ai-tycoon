import { cn } from '../../lib/utils.js'

interface ProgressProps {
  value: number        // 0 ~ 100
  className?: string
  showLabel?: boolean
}

export function Progress({ value, className, showLabel = false }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{clamped}%</p>
      )}
    </div>
  )
}

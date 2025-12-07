'use client'

interface ProgressBarProps {
    progress: number // 0-100
    label?: string
    showPercentage?: boolean
    size?: 'sm' | 'md' | 'lg'
    color?: 'primary' | 'success' | 'warning'
}

export default function ProgressBar({
    progress,
    label,
    showPercentage = true,
    size = 'md',
    color = 'primary',
}: ProgressBarProps) {
    const heights = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    }

    const colors = {
        primary: 'bg-primary-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
    }

    return (
        <div className="w-full">
            {(label || showPercentage) && (
                <div className="flex justify-between items-center mb-2">
                    {label && <span className="text-sm text-neutral-600">{label}</span>}
                    {showPercentage && (
                        <span className="text-sm font-medium text-neutral-700">
                            {Math.round(progress)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full ${heights[size]} bg-neutral-200 rounded-full overflow-hidden`}>
                <div
                    className={`${heights[size]} ${colors[color]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
        </div>
    )
}

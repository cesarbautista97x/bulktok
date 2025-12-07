'use client'

interface VideoCardProps {
    id: string
    thumbnailUrl?: string
    status: 'queued' | 'processing' | 'complete' | 'failed'
    createdAt: string
    aspectRatio: string
    prompt: string
    videoUrl?: string
    onDownload: (id: string) => void
}

export default function VideoCard({
    id,
    thumbnailUrl,
    status,
    createdAt,
    aspectRatio,
    prompt,
    videoUrl,
    onDownload,
}: VideoCardProps) {
    const statusConfig = {
        queued: {
            label: 'Queued',
            color: 'bg-neutral-100 text-neutral-600',
            icon: '⏳',
        },
        processing: {
            label: 'Processing',
            color: 'bg-blue-100 text-blue-600',
            icon: '⚙️',
        },
        complete: {
            label: 'Complete',
            color: 'bg-green-100 text-green-600',
            icon: '✓',
        },
        failed: {
            label: 'Failed',
            color: 'bg-red-100 text-red-600',
            icon: '✗',
        },
    }

    const config = statusConfig[status]

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden card-hover">
            {/* Thumbnail */}
            <div className="aspect-video bg-neutral-100 relative">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-neutral-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                    >
                        <span className="mr-1">{config.icon}</span>
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Metadata */}
                <div>
                    <p className="text-sm text-neutral-900 font-medium line-clamp-2">
                        {prompt}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-neutral-500">
                        <span>{formatDate(createdAt)}</span>
                        <span>•</span>
                        <span>{aspectRatio}</span>
                    </div>
                </div>

                {/* Actions */}
                {status === 'complete' && videoUrl && (
                    <button
                        onClick={() => onDownload(id)}
                        className="w-full btn-primary text-sm py-2"
                    >
                        <span className="flex items-center justify-center space-x-2">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            <span>Download</span>
                        </span>
                    </button>
                )}
                {status === 'processing' && (
                    <div className="w-full bg-neutral-100 rounded-lg py-2 px-3 text-sm text-neutral-600 text-center">
                        Processing... (2-5 min)
                    </div>
                )}
                {status === 'queued' && (
                    <div className="w-full bg-neutral-100 rounded-lg py-2 px-3 text-sm text-neutral-600 text-center">
                        In queue...
                    </div>
                )}
            </div>
        </div>
    )
}

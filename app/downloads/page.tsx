'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import DateRangePicker, { TimeRange } from '../components/DateRangePicker'
import { supabase } from '@/lib/supabase-client'

interface Video {
    id: string
    status: 'queued' | 'processing' | 'complete' | 'failed'
    created_at: string
    video_url?: string
    thumbnail_url?: string
    prompt: string
    aspect_ratio: string
    resolution: string
    error?: string
}

export default function DownloadsPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'processing' | 'failed'>('all')
    const [selectedRange, setSelectedRange] = useState<TimeRange>('last24h')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')

    // Drag-to-select state
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
    const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    // Fetch videos from Hedra
    const fetchVideos = async () => {
        setIsLoading(true)
        try {
            // Get API key from database via Settings API
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Please log in to view your videos')
                setIsLoading(false)
                return
            }

            // Fetch API key from database
            const settingsResponse = await fetch(`/api/settings?userId=${user.id}`)
            if (!settingsResponse.ok) {
                toast.error('Failed to load API key from settings')
                setIsLoading(false)
                return
            }

            const settingsData = await settingsResponse.json()
            const apiKey = settingsData.hedra_api_key

            if (!apiKey) {
                toast.error('Please configure your Hedra API key in Settings')
                setIsLoading(false)
                return
            }

            const response = await fetch('/api/hedra/videos', {
                headers: {
                    'x-hedra-api-key': apiKey,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch videos')
            }

            const data = await response.json()
            setVideos(data.videos || [])
        } catch (error) {
            console.error('Fetch error:', error)
            toast.error('Failed to load videos from Hedra')
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch videos on mount
    useEffect(() => {
        fetchVideos()
    }, [])

    // Auto-refresh for pending videos
    useEffect(() => {
        const hasPendingVideos = videos.some(
            (v) => v.status === 'queued' || v.status === 'processing'
        )

        if (!hasPendingVideos) return

        const interval = setInterval(() => {
            fetchVideos()
        }, 10000) // Refresh every 10 seconds

        return () => clearInterval(interval)
    }, [videos])

    // Drag-to-select handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start drag if clicking on the grid background, not on a video card
        if ((e.target as HTMLElement).closest('[data-video-id]')) return

        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setDragEnd({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragStart) return

        setDragEnd({ x: e.clientX, y: e.clientY })

        // Calculate selection box
        const box = {
            left: Math.min(dragStart.x, e.clientX),
            right: Math.max(dragStart.x, e.clientX),
            top: Math.min(dragStart.y, e.clientY),
            bottom: Math.max(dragStart.y, e.clientY),
        }

        // Find videos within selection box
        const videoElements = document.querySelectorAll('[data-video-id]')
        const newSelected = new Set<string>()

        videoElements.forEach((el) => {
            const rect = el.getBoundingClientRect()
            const videoId = el.getAttribute('data-video-id')
            const isComplete = el.getAttribute('data-video-status') === 'complete'

            // Check if video card intersects with selection box
            if (
                isComplete &&
                videoId &&
                rect.left < box.right &&
                rect.right > box.left &&
                rect.top < box.bottom &&
                rect.bottom > box.top
            ) {
                newSelected.add(videoId)
            }
        })

        setSelectedVideos(newSelected)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        setDragStart(null)
        setDragEnd(null)
    }

    // Toggle video selection
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedVideos)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedVideos(newSelected)
    }

    // Select all visible videos
    const selectAll = () => {
        const filteredVideos = getFilteredVideos()
        const completeVideos = filteredVideos.filter(v => v.status === 'complete')
        setSelectedVideos(new Set(completeVideos.map(v => v.id)))
    }

    // Deselect all
    const deselectAll = () => {
        setSelectedVideos(new Set())
    }

    // Download selected videos with real-time progress
    const handleDownloadSelected = async () => {
        if (selectedVideos.size === 0) {
            toast.error('Please select videos to download')
            return
        }

        setIsDownloading(true)
        setDownloadProgress(0)

        try {
            // Get API key from database
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error('Please log in to download videos')
                setIsDownloading(false)
                return
            }

            const settingsResponse = await fetch(`/api/settings?userId=${user.id}`)
            const settingsData = await settingsResponse.json()
            const apiKey = settingsData.hedra_api_key

            if (!apiKey) {
                toast.error('Please configure your Hedra API key in Settings')
                setIsDownloading(false)
                return
            }

            const videoIds = Array.from(selectedVideos)

            // Start progress tracking with SSE
            const eventSource = new EventSource(
                `/api/videos/download/progress?videoIds=${videoIds.join(',')}&apiKey=${encodeURIComponent(apiKey)}&t=${Date.now()}`
            )

            let progressComplete = false

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.error) {
                        toast.error(data.error)
                        eventSource.close()
                        setIsDownloading(false)
                        setDownloadProgress(0)
                        return
                    }

                    setDownloadProgress(data.progress)

                    if (data.message) {
                        toast.info(data.message)
                    }

                    if (data.complete) {
                        progressComplete = true
                        eventSource.close()
                    }
                } catch (err) {
                    console.error('Error parsing SSE data:', err)
                }
            }

            eventSource.onerror = () => {
                eventSource.close()
                if (!progressComplete) {
                    toast.error('Progress tracking failed')
                }
            }

            // Start actual download
            const response = await fetch(`/api/videos/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-hedra-api-key': apiKey,
                },
                body: JSON.stringify({ videoIds }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Download failed')
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition')
            let filename = `bulktok-videos-${Date.now()}.zip`

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '')
                }
            }

            console.log('Download filename:', filename)

            // Get blob and create download
            const blob = await response.blob()

            // Use direct download approach
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()

            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }, 100)

            setDownloadProgress(100)
            toast.success(`Downloaded ${selectedVideos.size} videos successfully!`)
            deselectAll()
        } catch (error) {
            console.error('Download error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to download videos')
        } finally {
            setIsDownloading(false)
            setTimeout(() => setDownloadProgress(0), 2000)
        }
    }

    // Filter videos by date range
    const filterByDateRange = (videos: Video[]) => {
        const now = new Date()
        let startDate: Date

        switch (selectedRange) {
            case 'last24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                break
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0))
                break
            case 'custom':
                if (!customStartDate || !customEndDate) return videos
                const start = new Date(customStartDate)
                const end = new Date(customEndDate)
                return videos.filter(v => {
                    const videoDate = new Date(v.created_at)
                    return videoDate >= start && videoDate <= end
                })
            default:
                return videos
        }

        return videos.filter(v => new Date(v.created_at) >= startDate)
    }

    // Get filtered videos
    const getFilteredVideos = () => {
        let filtered = videos

        // Filter by status
        if (statusFilter !== 'all') {
            if (statusFilter === 'processing') {
                filtered = filtered.filter(v => v.status === 'queued' || v.status === 'processing')
            } else {
                filtered = filtered.filter(v => v.status === statusFilter)
            }
        }

        // Filter by date range
        filtered = filterByDateRange(filtered)

        return filtered
    }

    const filteredVideos = getFilteredVideos()
    const completeCount = videos.filter(v => v.status === 'complete').length
    const processingCount = videos.filter(v => v.status === 'queued' || v.status === 'processing').length
    const failedCount = videos.filter(v => v.status === 'failed').length

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                                Downloads
                            </h1>
                            <p className="text-neutral-600">
                                Select and download your generated videos from Hedra
                            </p>
                        </div>
                        {selectedVideos.size > 0 && (
                            <button
                                onClick={handleDownloadSelected}
                                disabled={isDownloading}
                                className="btn-primary"
                            >
                                {isDownloading ? (
                                    <span className="flex items-center space-x-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{downloadProgress > 0 ? `${downloadProgress}%` : 'Downloading...'}</span>
                                    </span>
                                ) : (
                                    `Download Selected (${selectedVideos.size})`
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {videos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <p className="text-sm text-neutral-600">Total</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">{videos.length}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <p className="text-sm text-neutral-600">Complete</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{completeCount}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <p className="text-sm text-neutral-600">Processing</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{processingCount}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-neutral-200 p-4">
                            <p className="text-sm text-neutral-600">Failed</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{failedCount}</p>
                        </div>
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="mb-6">
                    <DateRangePicker
                        selectedRange={selectedRange}
                        onRangeChange={setSelectedRange}
                        customStartDate={customStartDate}
                        customEndDate={customEndDate}
                        onCustomDatesChange={(start, end) => {
                            setCustomStartDate(start)
                            setCustomEndDate(end)
                        }}
                    />
                </div>

                {/* Filters and Selection */}
                {videos.length > 0 && (
                    <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Status Filter */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-neutral-700">Filter:</span>
                                <div className="flex space-x-2">
                                    {(['all', 'complete', 'processing', 'failed'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setStatusFilter(filter)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${statusFilter === filter
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                }`}
                                        >
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selection Actions */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Select All
                                </button>
                                <span className="text-neutral-300">|</span>
                                <button
                                    onClick={deselectAll}
                                    className="text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Videos Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                <div className="aspect-video bg-neutral-100 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                                    <div className="h-3 bg-neutral-100 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                            No videos found
                        </h3>
                        <p className="text-neutral-600 mb-6">
                            {statusFilter === 'all'
                                ? 'Generate some videos to see them here'
                                : `No ${statusFilter} videos found in selected date range`
                            }
                        </p>
                        <a href="/generate" className="btn-primary inline-block">
                            Go to Generate
                        </a>
                    </div>
                ) : (
                    <div
                        ref={gridRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Drag selection box */}
                        {isDragging && dragStart && dragEnd && (
                            <div
                                className="fixed border-2 border-primary-500 bg-primary-100 bg-opacity-20 pointer-events-none z-50 rounded"
                                style={{
                                    left: Math.min(dragStart.x, dragEnd.x),
                                    top: Math.min(dragStart.y, dragEnd.y),
                                    width: Math.abs(dragEnd.x - dragStart.x),
                                    height: Math.abs(dragEnd.y - dragStart.y),
                                }}
                            />
                        )}

                        {filteredVideos.map((video) => (
                            <div
                                key={video.id}
                                data-video-id={video.id}
                                data-video-status={video.status}
                                onClick={() => video.status === 'complete' && toggleSelection(video.id)}
                                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${selectedVideos.has(video.id)
                                    ? 'border-primary-600 shadow-lg'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                    } ${video.status === 'complete' ? 'cursor-pointer' : 'cursor-default'}`}
                            >

                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-neutral-100">
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.prompt}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Checkbox */}
                                    {video.status === 'complete' && (
                                        <div className="absolute top-3 left-3">
                                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedVideos.has(video.id)
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'bg-white border-neutral-300'
                                                }`}>
                                                {selectedVideos.has(video.id) && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${video.status === 'complete' ? 'bg-green-100 text-green-700' :
                                            video.status === 'processing' || video.status === 'queued' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {video.status === 'queued' ? 'Queued' :
                                                video.status === 'processing' ? 'Processing' :
                                                    video.status === 'complete' ? 'Complete' :
                                                        'Failed'}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p className="text-sm font-medium text-neutral-900 mb-1 line-clamp-2">
                                        {video.prompt || 'No prompt'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-neutral-500">
                                        <span>{video.aspect_ratio || 'N/A'}</span>
                                        <span>{video.resolution || 'N/A'}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    {video.error && (
                                        <p className="text-xs text-red-600 mt-2">{video.error}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
    timestamp: string
    level: 'info' | 'error' | 'success'
    message: string
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Poll for logs from the server
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/logs')
                if (response.ok) {
                    const data = await response.json()
                    setLogs(data.logs || [])
                    setIsConnected(true)
                }
            } catch (error) {
                setIsConnected(false)
            }
        }, 2000) // Update every 2 seconds

        return () => clearInterval(interval)
    }, [])

    const clearLogs = async () => {
        await fetch('/api/logs', { method: 'DELETE' })
        setLogs([])
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">System Logs</h1>
                        <p className="text-neutral-600">Real-time logs from video generation</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-neutral-600">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        <button onClick={clearLogs} className="btn-secondary text-sm">
                            Clear Logs
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">How to use:</p>
                            <ul className="space-y-1 text-blue-800">
                                <li>• Keep this page open while generating videos</li>
                                <li>• Logs update automatically every 2 seconds</li>
                                <li>• Look for errors (red) to debug issues</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Logs Container */}
                <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-700 overflow-hidden">
                    <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
                        <span className="text-neutral-300 font-mono text-sm">Console Output</span>
                        <span className="text-neutral-500 text-xs">{logs.length} entries</span>
                    </div>

                    <div className="p-4 h-[600px] overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-neutral-500 text-center py-20">
                                No logs yet. Generate a video to see logs appear here.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start space-x-3 ${log.level === 'error' ? 'text-red-400' :
                                                log.level === 'success' ? 'text-green-400' :
                                                    'text-neutral-300'
                                            }`}
                                    >
                                        <span className="text-neutral-500 flex-shrink-0">{log.timestamp}</span>
                                        <span className="flex-shrink-0">
                                            {log.level === 'error' ? '❌' : log.level === 'success' ? '✓' : '•'}
                                        </span>
                                        <span className="break-all">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <h3 className="font-semibold text-neutral-900 mb-2">Common Issues</h3>
                        <ul className="text-sm text-neutral-600 space-y-1">
                            <li>• API key not configured → Go to Settings</li>
                            <li>• Python script error → Check file paths</li>
                            <li>• Upload failed → Check file formats</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <h3 className="font-semibold text-neutral-900 mb-2">What to Look For</h3>
                        <ul className="text-sm text-neutral-600 space-y-1">
                            <li>• "API key found" → Configuration OK</li>
                            <li>• "Saved image/audio" → Upload OK</li>
                            <li>• "Python stdout" → Script running</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4">
                        <h3 className="font-semibold text-neutral-900 mb-2">Need Help?</h3>
                        <ul className="text-sm text-neutral-600 space-y-1">
                            <li>• Copy error messages</li>
                            <li>• Check Settings page</li>
                            <li>• Verify API key is valid</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
